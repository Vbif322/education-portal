"use client";

import Button from "@/app/ui/Button/Button";
import Dialog from "@/app/ui/Dialog/Dialog";
import { FC } from "react";

type Props = {
  open: boolean;
  onDelete: () => void;
  onBack: () => void;
};

const DeleteDialog: FC<Props> = ({ open, onDelete, onBack }) => {
  return (
    <Dialog open={open} onClose={onBack}>
      <p style={{ fontSize: "1.5rem", marginBottom: "16px" }}>
        Вы уверены, что хотите удалить?
      </p>
      <div style={{ display: "flex", justifyContent: "space-around" }}>
        <Button onClick={onDelete} color="error">
          Да
        </Button>
        <Button onClick={onBack}>Нет</Button>
      </div>
    </Dialog>
  );
};

export default DeleteDialog;
