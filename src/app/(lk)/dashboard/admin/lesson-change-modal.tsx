"use client";

import { Lesson, LessonFormErrors } from "@/@types/course";
import LessonForm from "@/app/components/forms/lesson-form";
import Dialog from "@/app/ui/Dialog/Dialog";
import { useRouter } from "next/navigation";
import { FC, FormEvent, useState, useTransition } from "react";

type Props = {
  open: boolean;
  onClose?: () => void;
  lesson?: Lesson;
};

const LessonChangeModal: FC<Props> = ({ open, onClose, lesson }) => {
  const [errors, setErrors] = useState<LessonFormErrors>();
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const router = useRouter();
  const [_, startTransition] = useTransition();

  const onCloseHandle = () => {
    onClose && onClose();
  };

  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!lesson) return;
    setErrors(undefined);
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const xhr = new XMLHttpRequest();

    xhr.upload.addEventListener("progress", (event) => {
      if (event.lengthComputable) {
        const percentComplete = Math.round((event.loaded / event.total) * 100);
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
        onCloseHandle();
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

    xhr.open(
      "PATCH",
      location.origin + "/api/lessons/lesson" + "/?id=" + lesson.id
    );
    xhr.send(formData);
  };

  return (
    <>
      <Dialog open={open} onClose={onCloseHandle}>
        <LessonForm
          data={lesson}
          title="Изменить урок"
          errors={errors}
          handleSubmit={onSubmit}
          isLoading={loading}
          progress={progress}
        />
      </Dialog>
    </>
  );
};

export default LessonChangeModal;
