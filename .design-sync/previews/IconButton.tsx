import { IconButton } from "education-portal";
import { Pencil, Trash2, X, Plus, MoreVertical } from "lucide-react";

export const Edit = () => (
  <IconButton aria-label="Редактировать урок">
    <Pencil size={20} />
  </IconButton>
);

export const Delete = () => (
  <IconButton aria-label="Удалить урок">
    <Trash2 size={20} color="#d32f2f" />
  </IconButton>
);

export const Toolbar = () => (
  <div style={{ display: "flex", gap: 4, alignItems: "center" }}>
    <IconButton aria-label="Добавить модуль">
      <Plus size={20} />
    </IconButton>
    <IconButton aria-label="Редактировать">
      <Pencil size={20} />
    </IconButton>
    <IconButton aria-label="Удалить">
      <Trash2 size={20} color="#d32f2f" />
    </IconButton>
    <IconButton aria-label="Ещё">
      <MoreVertical size={20} />
    </IconButton>
  </div>
);

export const CloseDisabled = () => (
  <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
    <IconButton aria-label="Закрыть">
      <X size={20} />
    </IconButton>
    <IconButton aria-label="Закрыть" disabled style={{ opacity: 0.4 }}>
      <X size={20} />
    </IconButton>
  </div>
);
