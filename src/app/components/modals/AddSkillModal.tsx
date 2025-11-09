"use client";

import { FC, FormEvent, useState } from "react";
import s from "./AddSkillModal.module.css";
import Button from "@/app/ui/Button/Button";

type Props = {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (name: string) => Promise<
    | {
        success: boolean;
        error?: undefined;
      }
    | {
        success: boolean;
        error:
          | string
          | {
              errors: string[];
              properties?:
                | {
                    name?:
                      | {
                          errors: string[];
                        }
                      | undefined;
                  }
                | undefined;
            }
          | undefined;
      }
  >;
};

const AddSkillModal: FC<Props> = ({ isOpen, onClose, onAdd }) => {
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const result = await onAdd(name);

      if (!result.success) {
        if (typeof result.error === "string") {
          setError(result.error);
        } else if (typeof result.error === "object") {
          // Пытаемся извлечь первую ошибку из сложной структуры
          const complexError = result.error;
          const errorMessage =
            complexError.errors?.[0] ||
            complexError.properties?.name?.errors?.[0] ||
            "Ошибка валидации";
          setError(errorMessage);
        } else {
          // Если error undefined, но success false
          setError("Ошибка при добавлении навыка");
        }
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
      setError(null);
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
