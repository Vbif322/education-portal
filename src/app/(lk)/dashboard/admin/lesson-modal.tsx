"use client";

import { LessonFormErrors } from "@/app/@types/course";
import LessonForm from "@/app/components/forms/lesson-form";
import Button from "@/app/ui/Button/Button";
import Dialog from "@/app/ui/Dialog/Dialog";
import { FC, FormEvent, useState } from "react";

type Props = {};

const LessonModal: FC<Props> = () => {
  const [open, setOpen] = useState(false);
  const [errors, setErrors] = useState<LessonFormErrors>();

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
