"use client";

import { FC, FormEvent, useState, useEffect } from "react";
import s from "./course-form.module.css";
import { Module, Course } from "@/@types/course";
import Button from "@/app/ui/Button/Button";
import { useRouter } from "next/navigation";

type Props = {
  modules: Module[];
  course?: Course & {
    modules: Array<{
      order: number;
      module: Module;
    }>;
  };
  title: string;
  submitButtonText: string;
  onSubmit: (data: {
    name: string;
    description?: string;
    privacy: "public" | "private";
    modules: { moduleId: number; order: number }[];
  }) => Promise<{ success: boolean; error?: string }>;
};

const CourseForm: FC<Props> = ({
  modules,
  course,
  title,
  submitButtonText,
  onSubmit,
}) => {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [privacy, setPrivacy] = useState<"public" | "private">("private");
  const [selectedModules, setSelectedModules] = useState<
    { module: Module; order: number }[]
  >([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>();

  const router = useRouter();

  // Предзаполнение формы при редактировании
  useEffect(() => {
    if (course) {
      setName(course.name);
      setDescription(course.description || "");
      setPrivacy(course.privacy as "public" | "private");
      if (course.modules) {
        setSelectedModules(
          course.modules.map((cm) => ({
            module: cm.module,
            order: cm.order,
          }))
        );
      }
    }
  }, [course]);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(undefined);
    setLoading(true);
    try {
      const result = await onSubmit({
        name,
        description,
        privacy,
        modules: selectedModules.map((sm) => ({
          moduleId: sm.module.id,
          order: sm.order,
        })),
      });

      if (!result.success) {
        setError(result.error || "Ошибка при сохранении курса");
      } else {
        router.push("/dashboard/admin");
        router.refresh();
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Ошибка при сохранении курса"
      );
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddModule = (module: Module) => {
    if (selectedModules.some((sm) => sm.module.id === module.id)) {
      return; // Модуль уже добавлен
    }
    setSelectedModules([
      ...selectedModules,
      { module, order: selectedModules.length },
    ]);
  };

  const handleRemoveModule = (moduleId: number) => {
    const filtered = selectedModules.filter((sm) => sm.module.id !== moduleId);
    // Обновляем порядок после удаления
    const reordered = filtered.map((sm, index) => ({ ...sm, order: index }));
    setSelectedModules(reordered);
  };

  const handleMoveUp = (index: number) => {
    if (index === 0) return;
    const newSelected = [...selectedModules];
    [newSelected[index - 1], newSelected[index]] = [
      newSelected[index],
      newSelected[index - 1],
    ];
    // Обновляем порядок
    const reordered = newSelected.map((sm, idx) => ({ ...sm, order: idx }));
    setSelectedModules(reordered);
  };

  const handleMoveDown = (index: number) => {
    if (index === selectedModules.length - 1) return;
    const newSelected = [...selectedModules];
    [newSelected[index], newSelected[index + 1]] = [
      newSelected[index + 1],
      newSelected[index],
    ];
    // Обновляем порядок
    const reordered = newSelected.map((sm, idx) => ({ ...sm, order: idx }));
    setSelectedModules(reordered);
  };

  const availableModules = modules.filter(
    (module) => !selectedModules.some((sm) => sm.module.id === module.id)
  );

  return (
    <div className={s.container}>
      <h2>{title}</h2>

      <form onSubmit={handleSubmit} className={s.form}>
        <div className={s.formGroup}>
          <label htmlFor="name">
            Название курса<span className={s.required}>*</span>
          </label>
          <input
            id="name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            placeholder="Введите название курса"
            className={s.input}
          />
        </div>

        <div className={s.formGroup}>
          <label htmlFor="description">Описание</label>
          <textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Введите описание курса"
            className={s.textarea}
            rows={4}
          />
        </div>

        <div className={s.formGroup}>
          <label htmlFor="privacy">
            Видимость<span className={s.required}>*</span>
          </label>
          <select
            id="privacy"
            value={privacy}
            onChange={(e) => setPrivacy(e.target.value as "public" | "private")}
            className={s.select}
            required
          >
            <option value="private">Приватный</option>
            <option value="public">Публичный</option>
          </select>
        </div>

        <div className={s.modulesSection}>
          <h3>Модули в курсе</h3>

          {selectedModules.length > 0 ? (
            <div className={s.selectedModules}>
              {selectedModules.map((sm, index) => (
                <div key={sm.module.id} className={s.moduleItem}>
                  <div className={s.moduleInfo}>
                    <span className={s.moduleOrder}>{index + 1}.</span>
                    <span className={s.moduleName}>{sm.module.name}</span>
                  </div>
                  <div className={s.moduleActions}>
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
                      disabled={index === selectedModules.length - 1}
                      className={s.actionButton}
                      title="Переместить вниз"
                    >
                      ↓
                    </button>
                    <button
                      type="button"
                      onClick={() => handleRemoveModule(sm.module.id)}
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
              Модули не добавлены. Выберите модули из списка ниже.
            </p>
          )}
        </div>

        <div className={s.availableModulesSection}>
          <h3>Доступные модули</h3>
          {availableModules.length > 0 ? (
            <div className={s.availableModules}>
              {availableModules.map((module) => (
                <div key={module.id} className={s.availableModule}>
                  <span>{module.name}</span>
                  <Button
                    type="button"
                    onClick={() => handleAddModule(module)}
                    variant="text"
                  >
                    Добавить
                  </Button>
                </div>
              ))}
            </div>
          ) : (
            <p className={s.emptyMessage}>Все модули уже добавлены в курс</p>
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
            disabled={loading || !name.trim() || selectedModules.length < 1}
          >
            {loading ? "Сохранение..." : submitButtonText}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default CourseForm;
