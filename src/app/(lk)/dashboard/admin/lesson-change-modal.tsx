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
  const router = useRouter();
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [isPending, startTransition] = useTransition();

  const onCloseHandle = () => {
    if (onClose) {
      onClose();
    }
  };

  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!lesson) return;
    setLoading(true);
    const body = new FormData(e.target as HTMLFormElement);
    const res = await fetch(
      location.origin + "/api/lessons/lesson" + "/?id=" + lesson.id,
      {
        method: "PATCH",
        body,
      }
    );
    const data = await res.json();
    setLoading(false);
    if (!res.ok) {
      setErrors(data);
    } else {
      startTransition(() => {
        router.refresh();
      });
      onCloseHandle();
    }
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
        />
      </Dialog>
    </>
  );
};

export default LessonChangeModal;
