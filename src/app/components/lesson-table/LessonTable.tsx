"use client";

import { Lesson } from "@/@types/course";
import Button from "@/app/ui/Button/Button";
import { FC } from "react";
import s from "./style.module.css";

type Props = {
  data: Lesson[];
  handleChange: (arg01: Lesson["id"]) => void;
  handleAttach: (arg01: Lesson["id"]) => void;
  handleDelete: (arg01: Lesson["id"]) => void;
};

const LessonTable: FC<Props> = ({
  data,
  handleChange,
  handleAttach,
  handleDelete,
}) => {
  return (
    <div className={s.table__container}>
      <table className={s.table}>
        <thead>
          <tr>
            <th>Название</th>
            <th>Доступность</th>
            <th style={{ textAlign: "center" }}>Управление</th>
          </tr>
        </thead>
        <tbody>
          {data.map((lesson) => {
            return (
              <tr key={lesson.id}>
                <td>{lesson.name}</td>
                <td>{lesson.status}</td>
                <td style={{ display: "flex", justifyContent: "center" }}>
                  <Button
                    variant="text"
                    onClick={() => handleChange(lesson.id)}
                  >
                    Изменить
                  </Button>
                  <Button
                    variant="text"
                    onClick={() => handleAttach(lesson.id)}
                  >
                    Прикрепить материалы
                  </Button>
                  <Button
                    style={{ backgroundColor: "#d32f2f" }}
                    onClick={() => handleDelete(lesson.id)}
                  >
                    Удалить
                  </Button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default LessonTable;
