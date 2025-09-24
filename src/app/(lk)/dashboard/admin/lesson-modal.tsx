"use client";

import { LessonFormErrors } from "@/@types/course";
import LessonForm from "@/app/components/forms/lesson-form";
import Button from "@/app/ui/Button/Button";
import Dialog from "@/app/ui/Dialog/Dialog";
import { useRouter } from "next/navigation";
import { FC, FormEvent, useState, useTransition } from "react";

type Props = {};

const LessonModal: FC<Props> = () => {
  const [open, setOpen] = useState(false);
  const [errors, setErrors] = useState<LessonFormErrors>();
  const router = useRouter();
  const [_, startTransition] = useTransition();

  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrors(undefined);
    const body = new FormData(e.target as HTMLFormElement);
    const res = await fetch(location.origin + "/api/lessons/lesson", {
      method: "POST",
      body,
    });
    const data = await res.json();
    if (!res.ok) {
      setErrors(data);
    } else {
      startTransition(() => {
        router.refresh();
      });
      setOpen(false);
    }
  };
  return (
    <>
      <Button onClick={() => setOpen(true)}>Добавить урок</Button>
      <Dialog open={open} onClose={() => setOpen(false)}>
        <LessonForm errors={errors} handleSubmit={onSubmit} />
      </Dialog>
    </>
  );
};

export default LessonModal;
