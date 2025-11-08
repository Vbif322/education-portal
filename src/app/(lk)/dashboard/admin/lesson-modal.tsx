"use client";

import { LessonFormErrors } from "@/@types/course";
import LessonForm from "@/app/components/forms/lesson-form";
import Button from "@/app/ui/Button/Button";
import Dialog from "@/app/ui/Dialog/Dialog";
import { useRouter } from "next/navigation";
import { FC, FormEvent, useState, useTransition } from "react";

const LessonModal: FC = () => {
  const [open, setOpen] = useState(false);
  const [errors, setErrors] = useState<LessonFormErrors>();
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const router = useRouter();
  const [, startTransition] = useTransition();

  const onClose = () => {
    setErrors(undefined);
    setOpen(false);
  };

  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrors(undefined);
    setLoading(true);

    const formData = new FormData(e.currentTarget);

    const xhr = new XMLHttpRequest();

    xhr.upload.addEventListener("progress", (event) => {
      if (event.lengthComputable) {
        const percentComplete = Math.round((event.loaded / event.total) * 100);
        console.log(event.loaded);
        setProgress(percentComplete);
      }
    });

    xhr.addEventListener("load", () => {
      setLoading(false);
      if (xhr.status >= 200 && xhr.status < 300) {
        startTransition(() => {
          router.refresh();
        });
        setProgress(0);
        setErrors(undefined);
        setOpen(false);
      } else {
        // Обработка ошибок от сервера (например, файл уже существует)
        try {
          const response = JSON.parse(xhr.responseText);
          setProgress(0);
          setErrors(response);
        } catch (e) {
          console.log(e);
          // setErrors(`Ошибка сервера: ${xhr.status}`);
        }
      }
    });

    xhr.addEventListener("error", (e) => {
      console.log(e, "err");
      setLoading(false);
      // setError("Произошла ошибка при загрузке файла.");
    });

    xhr.open("POST", location.origin + "/api/lessons/lesson");
    xhr.send(formData);
  };
  return (
    <>
      <Button onClick={() => setOpen(true)}>Добавить урок</Button>
      <Dialog open={open} onClose={onClose}>
        <LessonForm
          title="Добавить новый урок"
          errors={errors}
          handleSubmit={onSubmit}
          isLoading={loading}
          progress={progress}
        />
      </Dialog>
    </>
  );
};

export default LessonModal;
