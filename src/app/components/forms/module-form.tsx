"use client";

import { FC, FormEvent, useState, useEffect } from "react";
import s from "./module-form.module.css";
import { Lesson, Module } from "@/@types/course";
import Button from "@/app/ui/Button/Button";
import { useRouter } from "next/navigation";

type Props = {
  lessons: Lesson[];
  module?: Module & {
    lessons: Array<{
      order: number;
      lesson: Lesson;
    }>;
  };
  title: string;
  submitButtonText: string;
  onSubmit: (data: {
    name: string;
    description?: string;
    lessons: { lessonId: number; order: number }[];
  }) => Promise<{ success: boolean; error?: string }>;
};

const ModuleForm: FC<Props> = ({
  lessons,
  module,
  title,
  submitButtonText,
  onSubmit,
}) => {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [selectedLessons, setSelectedLessons] = useState<
    { lesson: Lesson; order: number }[]
  >([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>();

  const router = useRouter();

  // Предзаполнение формы при редактировании
  useEffect(() => {
    if (module) {
      setName(module.name);
      setDescription(module.description || "");
      if (module.lessons) {
        setSelectedLessons(
          module.lessons.map((ml) => ({
            lesson: ml.lesson,
            order: ml.order,
          }))
        );
      }
    }
  }, [module]);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(undefined);
    setLoading(true);
    try {
      const result = await onSubmit({
        name,
        description,
        lessons: selectedLessons.map((sl) => ({
          lessonId: sl.lesson.id,
          order: sl.order,
        })),
      });

      if (!result.success) {
        setError(result.error || "Ошибка при сохранении модуля");
      } else {
        router.push("/dashboard/admin");
        router.refresh();
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Ошибка при сохранении модуля"
      );
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddLesson = (lesson: Lesson) => {
    if (selectedLessons.some((sl) => sl.lesson.id === lesson.id)) {
      return; // Урок уже добавлен
    }
    setSelectedLessons([
      ...selectedLessons,
      { lesson, order: selectedLessons.length },
    ]);
  };

  const handleRemoveLesson = (lessonId: number) => {
    const filtered = selectedLessons.filter((sl) => sl.lesson.id !== lessonId);
    // Обновляем порядок после удаления
    const reordered = filtered.map((sl, index) => ({ ...sl, order: index }));
    setSelectedLessons(reordered);
  };

  const handleMoveUp = (index: number) => {
    if (index === 0) return;
    const newSelected = [...selectedLessons];
    [newSelected[index - 1], newSelected[index]] = [
      newSelected[index],
      newSelected[index - 1],
    ];
    // Обновляем порядок
    const reordered = newSelected.map((sl, idx) => ({ ...sl, order: idx }));
    setSelectedLessons(reordered);
  };

  const handleMoveDown = (index: number) => {
    if (index === selectedLessons.length - 1) return;
    const newSelected = [...selectedLessons];
    [newSelected[index], newSelected[index + 1]] = [
      newSelected[index + 1],
      newSelected[index],
    ];
    // Обновляем порядок
    const reordered = newSelected.map((sl, idx) => ({ ...sl, order: idx }));
    setSelectedLessons(reordered);
  };

  const availableLessons = lessons.filter(
    (lesson) => !selectedLessons.some((sl) => sl.lesson.id === lesson.id)
  );

  return (
    <div className={s.container}>
      <h2>{title}</h2>

      <form onSubmit={handleSubmit} className={s.form}>
        <div className={s.formGroup}>
          <label htmlFor="name">
            Название модуля<span className={s.required}>*</span>
          </label>
          <input
            id="name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            placeholder="Введите название модуля"
            className={s.input}
          />
        </div>

        <div className={s.formGroup}>
          <label htmlFor="description">Описание</label>
          <textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Введите описание модуля"
            className={s.textarea}
            rows={4}
          />
        </div>

        <div className={s.lessonsSection}>
          <h3>Уроки в модуле</h3>

          {selectedLessons.length > 0 ? (
            <div className={s.selectedLessons}>
              {selectedLessons.map((sl, index) => (
                <div key={sl.lesson.id} className={s.lessonItem}>
                  <div className={s.lessonInfo}>
                    <span className={s.lessonOrder}>{index + 1}.</span>
                    <span className={s.lessonName}>{sl.lesson.name}</span>
                  </div>
                  <div className={s.lessonActions}>
                    <button
                      type="button"
                      onClick={() => handleMoveUp(index)}
                      disabled={index === 0}
                      className={s.actionButton}
                      title="Переместить вверх"
                    >
                      ↑
                    </button>
                    <button
                      type="button"
                      onClick={() => handleMoveDown(index)}
                      disabled={index === selectedLessons.length - 1}
                      className={s.actionButton}
                      title="Переместить вниз"
                    >
                      ↓
                    </button>
                    <button
                      type="button"
                      onClick={() => handleRemoveLesson(sl.lesson.id)}
                      className={`${s.actionButton} ${s.removeButton}`}
                      title="Удалить"
                    >
                      ✕
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className={s.emptyMessage}>
              Уроки не добавлены. Выберите уроки из списка ниже.
            </p>
          )}
        </div>

        <div className={s.availableLessonsSection}>
          <h3>Доступные уроки</h3>
          {availableLessons.length > 0 ? (
            <div className={s.availableLessons}>
              {availableLessons.map((lesson) => (
                <div key={lesson.id} className={s.availableLesson}>
                  <span>{lesson.name}</span>
                  <Button
                    type="button"
                    onClick={() => handleAddLesson(lesson)}
                    variant="text"
                  >
                    Добавить
                  </Button>
                </div>
              ))}
            </div>
          ) : (
            <p className={s.emptyMessage}>Все уроки уже добавлены в модуль</p>
          )}
        </div>

        {error && <div className={s.error}>{error}</div>}

        <div className={s.formActions}>
          <Button
            type="button"
            variant="text"
            onClick={() => router.push("/dashboard/admin")}
            disabled={loading}
          >
            Отмена
          </Button>
          <Button
            type="submit"
            disabled={loading || !name.trim() || selectedLessons.length < 1}
          >
            {loading ? "Сохранение..." : submitButtonText}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default ModuleForm;
