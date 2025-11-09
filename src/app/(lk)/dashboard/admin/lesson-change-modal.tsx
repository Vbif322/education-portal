"use client";

import { Lesson, LessonFormErrors } from "@/@types/course";
import LessonForm from "@/app/components/forms/lesson-form";
import Dialog from "@/app/ui/Dialog/Dialog";
import { useRouter } from "next/navigation";
import { FC, FormEvent, useRef, useState, useTransition } from "react";

type Props = {
  open: boolean;
  onClose?: () => void;
  lesson?: Lesson;
};

const initialProgress = {
  percentage: 0,
  loaded: 0,
  total: 0,
};

const LessonChangeModal: FC<Props> = ({ open, onClose, lesson }) => {
  const [errors, setErrors] = useState<LessonFormErrors>();
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(initialProgress);
  const router = useRouter();
  const [, startTransition] = useTransition();
  const xhrRef = useRef<XMLHttpRequest | null>(null);

  const onCloseHandle = () => {
    // Отменяем XMLHttpRequest, если загрузка активна
    if (xhrRef.current) {
      xhrRef.current.abort();
      xhrRef.current = null;
    }
    setErrors(undefined);
    setProgress(initialProgress);
    setLoading(false);
    if (onClose) {
      onClose();
    }
  };

  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!lesson) return;
    setErrors(undefined);
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const xhr = new XMLHttpRequest();
    xhrRef.current = xhr;

    xhr.upload.addEventListener("progress", (event) => {
      if (event.lengthComputable) {
        const percentComplete = Math.round((event.loaded / event.total) * 100);
        setProgress({
          percentage: percentComplete,
          loaded: +(event.loaded / 1024 / 1024).toFixed(1),
          total: +(event.total / 1024 / 1024).toFixed(1),
        });
      }
    });

    xhr.addEventListener("load", () => {
      setLoading(false);
      xhrRef.current = null;
      if (xhr.status >= 200 && xhr.status < 300) {
        startTransition(() => {
          router.refresh();
        });
        setProgress(initialProgress);
        setErrors(undefined);
        onCloseHandle();
      } else {
        // Обработка ошибок от сервера (например, файл уже существует)
        try {
          const response = JSON.parse(xhr.responseText);
          setProgress(initialProgress);
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
      xhrRef.current = null;
      setProgress(initialProgress);
      // setError("Произошла ошибка при загрузке файла.");
    });

    xhr.addEventListener("abort", () => {
      setLoading(false);
      xhrRef.current = null;
      setProgress(initialProgress);
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
