"use client";

import { FC, FormEvent, useRef } from "react";
import s from "./style.module.css";
import Button from "@/app/ui/Button/Button";
import { Lesson, LessonFormErrors } from "@/@types/course";

const LessonForm: FC<{
  handleSubmit: (e: FormEvent<HTMLFormElement>) => void;
  errors?: LessonFormErrors;
  isLoading?: boolean;
  title: string;
  data?: Lesson;
}> = ({ handleSubmit, errors, isLoading, title, data }) => {
  const formRef = useRef(null);
  return (
    <div className={s["form-container"]}>
      <h2 className={s.h2}>{title}</h2>
      <form ref={formRef} onSubmit={handleSubmit}>
        <div>
          <label htmlFor="name">Название урока</label>
          <input
            id="name"
            type="text"
            name="name"
            required
            defaultValue={data?.name}
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
          <label htmlFor="videofile">
            Файл
            <span style={{ color: "#000", fontSize: "0.875rem" }}>
              {" - " + (data?.videoURL ? data.videoURL : "")}
            </span>
          </label>
          <input
            id="videofile"
            type="file"
            name="videofile"
            placeholder="https://example.com/video.mp4"
            required={!data?.videoURL}
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
            defaultValue={data?.status || "private"}
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
            defaultValue={data?.description || ""}
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
        <Button type="submit" disabled={isLoading}>
          {isLoading ? "Загрузка" : data?.name ? "Изменить" : "Добавить"}
        </Button>
      </form>
    </div>
  );
};

export default LessonForm;
