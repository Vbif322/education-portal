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
  const router = useRouter();
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [isPending, startTransition] = useTransition();

  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrors(undefined);
    setLoading(true);
    const body = new FormData(e.target as HTMLFormElement);
    const res = await fetch(location.origin + "/api/lessons/lesson", {
      method: "POST",
      body,
    });
    const data = await res.json();
    setLoading(false);
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
        <LessonForm
          title="Добавить новый урок"
          errors={errors}
          handleSubmit={onSubmit}
          isLoading={loading}
        />
      </Dialog>
    </>
  );
};

export default LessonModal;
