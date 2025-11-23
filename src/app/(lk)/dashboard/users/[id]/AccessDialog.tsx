import { FC } from "react";
import Dialog from "@/app/ui/Dialog/Dialog";
import Button from "@/app/ui/Button/Button";
import s from "./style.module.css";

type AccessItem = {
  id: number;
  name: string;
};

type Props = {
  open: boolean;
  onClose: () => void;
  title: string;
  itemsLabel: string;
  emptyText: string;
  items: AccessItem[];
  selectedItems: number[];
  onItemChange: (id: number, checked: boolean) => void;
  expiresAt: string;
  onExpiresAtChange: (value: string) => void;
  onSubmit: () => void;
};

const AccessDialog: FC<Props> = ({
  open,
  onClose,
  title,
  itemsLabel,
  emptyText,
  items,
  selectedItems,
  onItemChange,
  expiresAt,
  onExpiresAtChange,
  onSubmit,
}) => {
  return (
    <Dialog open={open} onClose={onClose}>
      <div className={s.dialog__content}>
        <h3 className={s.dialog__title}>{title}</h3>
        <div className={s.form__group}>
          <label className={s.form__label}>{itemsLabel}</label>
          <div className={s.checkbox__list}>
            {items.map((item) => (
              <label key={item.id} className={s.checkbox__item}>
                <input
                  type="checkbox"
                  checked={selectedItems.includes(item.id)}
                  onChange={(e) => onItemChange(item.id, e.target.checked)}
                />
                <span>{item.name}</span>
              </label>
            ))}
            {items.length === 0 && (
              <span className={s.form__hint}>{emptyText}</span>
            )}
          </div>
        </div>
        <div className={s.form__group}>
          <label className={s.form__label}>Дата окончания (опционально)</label>
          <input
            type="date"
            className={s.form__input}
            value={expiresAt}
            onChange={(e) => onExpiresAtChange(e.target.value)}
          />
          <span className={s.form__hint}>Оставьте пустым для бессрочного доступа</span>
        </div>
        <div className={s.dialog__actions}>
          <Button variant="text" onClick={onClose}>
            Отмена
          </Button>
          <Button onClick={onSubmit} disabled={selectedItems.length === 0}>
            Добавить
          </Button>
        </div>
      </div>
    </Dialog>
  );
};

export default AccessDialog;
