import { FC, ReactNode } from "react";
import s from "./style.module.css";
import { StarIcon } from "lucide-react";
import Divider from "@/app/ui/Divider";
import { Block } from "./subcomponents/Block";
import { Skill } from "./subcomponents/Skill";

type Props = {
  params: Promise<{ id: string }>;
};

const CoursePage: FC<Props> = async ({ params }) => {
  const { id } = await params;
  return (
    <div className={s.container}>
      <div className={s.blocks}>
        <Block title="1 Урок" subtitle="Познакомьтесь с темой" />
        <Block title="Уровень" subtitle="Начинающий" />
        <Block
          title={
            <div style={{ display: "flex", alignItems: "center" }}>
              4.6
              <StarIcon
                style={{ height: "16px", fill: "#0056d2", stroke: "none" }}
              />
            </div>
          }
          lastElement
        />
      </div>
      <div className={s.wrapper}>
        <div>
          <div className={s.background}></div>
          <h4 className={s.title}>Методы бережливого производства</h4>
          <button className={s.button}>Начать обучение</button>
        </div>
        <div className={s.content}>
          <h3>О курсе</h3>
          <p className={s.content__subtitle}>Чему вы научитесь</p>
          <div className={s.skills__container}>
            <Skill
              description={
                "Умение видеть лишние операции, простои, перепроизводство и оптимизировать процессы"
              }
            />
            <Skill
              description={
                "Анализ бизнес-процессов “от начала до конца” и поиска узких мест"
              }
            />
            <Skill
              description={
                "Умение внедрять системные методы улучшений на производстве или в офисных процессах"
              }
            />
            <Skill
              description={
                "Способность мотивировать сотрудников, формировать культуру непрерывных улучшений"
              }
            />
          </div>
          <p className={s.content__subtitle}>Получаемые навыки</p>
        </div>
      </div>

      {/* <video width="320" height="240" controls preload="none">
          <source src="/videos/Как менялся пит-стоп.mp4" type="video/mp4" />
          Your browser does not support the video tag.
        </video> */}
    </div>
  );
};

export default CoursePage;
