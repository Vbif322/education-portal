"use client";

import LessonForm from "@/app/components/forms/lesson-form";
import Button from "@/app/ui/Button/Button";
import Dialog from "@/app/ui/Dialog/Dialog";
import { FC, useState } from "react";

type Props = {};

const LessonModal: FC<Props> = () => {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Button onClick={() => setOpen(true)}>Добавить урок</Button>
      <Dialog open={open} onClose={() => setOpen(false)}>
        <LessonForm />
      </Dialog>
    </>
  );
};

export default LessonModal;
