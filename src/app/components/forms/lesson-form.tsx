"use client";

import { FC, FormEvent, useRef } from "react";
import s from "./style.module.css";
import Button from "@/app/ui/Button/Button";
import { LessonFormErrors } from "@/@types/course";

const LessonForm: FC<{
  handleSubmit: (e: FormEvent<HTMLFormElement>) => void;
  errors?: LessonFormErrors;
}> = ({ handleSubmit, errors }) => {
  const formRef = useRef(null);

  return (
    <div className={s["form-container"]}>
      <h2 className={s.h2}>Добавить новый урок</h2>
      <form ref={formRef} onSubmit={handleSubmit}>
        <div>
          <label htmlFor="name">Название урока</label>
          <input
            id="name"
            type="text"
            name="name"
            required
            autoComplete="off"
            style={{
              borderColor:
                errors?.properties && "name" in errors?.properties
                  ? "#c33341"
                  : "inherit",
            }}
          />
          {
            <span className={s.error}>
              {errors?.properties?.name?.errors || " "}
            </span>
          }
        </div>
        <div>
          <label htmlFor="videofile">Файл</label>
          <input
            id="videofile"
            type="file"
            name="videofile"
            placeholder="https://example.com/video.mp4"
            required
            autoComplete="off"
            style={{
              borderColor:
                errors?.properties && "videofile" in errors?.properties
                  ? "#c33341"
                  : "inherit",
            }}
          />
          {
            <span className={s.error}>
              {errors?.properties?.videofile?.errors || " "}
            </span>
          }
        </div>
        <div>
          <label htmlFor="status">Статус</label>
          <select
            id="status"
            name="status"
            defaultValue="private"
            required
            style={{
              borderColor:
                errors?.properties && "status" in errors?.properties
                  ? "#c33341"
                  : "inherit",
            }}
          >
            <option value="private">Закрытое</option>
            <option value="public">Открытое</option>
          </select>
          {
            <span className={s.error}>
              {errors?.properties?.status?.errors || " "}
            </span>
          }
        </div>
        <div className="form-group">
          <label htmlFor="description">Описание</label>
          <textarea
            id="description"
            name="description"
            rows={4}
            autoComplete="off"
            style={{
              borderColor:
                errors?.properties && "description" in errors?.properties
                  ? "#c33341"
                  : "inherit",
            }}
          ></textarea>
          {
            <span className={s.error}>
              {errors?.properties?.description?.errors || " "}
            </span>
          }
        </div>
        <Button type="submit">Добавить</Button>
      </form>
    </div>
  );
};

export default LessonForm;
