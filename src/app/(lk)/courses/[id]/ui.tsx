"use client";
import { FC } from "react";
import { Block } from "./subcomponents/Block";
import s from "./style.module.css";
import { StarIcon } from "lucide-react";
import { redirect } from "next/navigation";
import { Skill } from "./subcomponents/Skill";
import Chip from "@/app/ui/Chip/Chip";

type Props = {
  id: string;
  skills: string[];
};

const UI: FC<Props> = ({ id, skills }) => {
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
          <button
            className={s.button}
            onClick={() => redirect(id + "/modules")}
          >
            Начать обучение
          </button>
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
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: "8px",
              marginTop: "16px",
            }}
          >
            {skills.map((skill) => {
              return <Chip key={skill} text={skill} />;
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default UI;
