import { Lesson } from "@/app/@types/course";
import Button from "@/app/ui/Button/Button";
import { FC } from "react";
import s from "./style.module.css";

type Props = {
  data: Lesson[];
};

const LessonTable: FC<Props> = ({ data }) => {
  return (
    <div className={s.table__container}>
      <table className={s.table}>
        <thead>
          <tr>
            <th>Название</th>
            <th>Доступность</th>
            <th>Управление</th>
          </tr>
        </thead>
        <tbody>
          {data.map((lesson) => {
            return (
              <tr key={lesson.id}>
                <td>{lesson.name}</td>
                <td>{lesson.status}</td>
                <td>
                  <Button variant="text">Изменить</Button>
                  <Button variant="text">Прикрепить материалы</Button>
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
