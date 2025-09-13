import { FC } from "react";

type Props = {};

const ThemePage: FC<Props> = (props) => {
  return (
    <div>
      <p>Вернуться к списку курсов</p>
      <p>Бизнес-старт: от идеи до первых продаж</p>
      <video width="1080" height="720" controls preload="none">
        <source src="/videos/Управление задачами 12.mp4" type="video/mp4" />
        Your browser does not support the video tag.
      </video>
    </div>
  );
};

export default ThemePage;
