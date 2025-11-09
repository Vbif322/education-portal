"use client";

import { FC, FormEvent, useState } from "react";
import s from "./AddSkillModal.module.css";
import Button from "@/app/ui/Button/Button";

type Props = {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (name: string) => Promise<{ success: boolean; error?: string }>;
};

const AddSkillModal: FC<Props> = ({ isOpen, onClose, onAdd }) => {
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>();

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(undefined);
    setLoading(true);

    try {
      const result = await onAdd(name);

      if (!result.success) {
        setError(result.error || "Ошибка при добавлении навыка");
      } else {
        setName("");
        onClose();
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Ошибка при добавлении навыка"
      );
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading) {
      setName("");
      setError(undefined);
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className={s.overlay} onClick={handleClose}>
      <div className={s.modal} onClick={(e) => e.stopPropagation()}>
        <div className={s.header}>
          <h3>Добавить новый навык</h3>
          <button
            type="button"
            className={s.closeButton}
            onClick={handleClose}
            disabled={loading}
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className={s.form}>
          <div className={s.formGroup}>
            <label htmlFor="skillName">
              Название навыка<span className={s.required}>*</span>
            </label>
            <input
              id="skillName"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Например: Бережливое производство, 5S, Анализ потерь"
              className={s.input}
              required
              autoFocus
              disabled={loading}
            />
          </div>

          {error && <div className={s.error}>{error}</div>}

          <div className={s.formActions}>
            <Button
              type="button"
              variant="text"
              onClick={handleClose}
              disabled={loading}
            >
              Отмена
            </Button>
            <Button type="submit" disabled={loading || !name.trim()}>
              {loading ? "Добавление..." : "Добавить"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddSkillModal;
