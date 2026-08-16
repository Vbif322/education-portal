"use client";
import { FC, useState } from "react";
import { Block } from "./subcomponents/Block";
import s from "./style.module.css";
import { useRouter } from "next/navigation";
// import { Skill } from "./subcomponents/Skill";
import Chip from "@/app/ui/Chip/Chip";
import { CourseWithMetadata } from "@/@types/course";
import { pluralize } from "@/app/utils/helpers";
import ContactDialog from "@/app/components/dialogs/contact-dialog";
import { User } from "@/@types/user";
import { canManage } from "@/app/utils/permissions";

type Props = {
  skills?: Array<{
    skill: {
      id: number;
      name: string;
      createdAt: Date;
      updatedAt: Date;
    };
  }>;
  hasAccess: boolean;
  user: Pick<User, "email" | "id" | "role"> | null;
} & CourseWithMetadata;

const UI: FC<Props> = ({
  skills,
  hasAccess,
  id,
  name,
  description,
  moduleCount,
  lessonCount,
  program,
  user,
}) => {
  const router = useRouter();
  const [open, setOpen] = useState(false);

  // Раньше кнопка писала строку в `usersToCourses` («зачисление») — модель,
  // независимую от реального доступа, из-за чего подпись была одинаковой
  // и для купившего, и для закрытого курса. Теперь решает только доступ.
  const canOpen = canManage(user) || hasAccess;

  const handleButtonClick = () => {
    if (canOpen) {
      router.push(id + "/lessons");
    } else {
      setOpen(true);
    }
  };

  return (
    <>
      <ContactDialog
        open={open}
        onClose={() => setOpen(false)}
        source="course"
        sourceId={String(id)}
        defaultEmail={user?.email}
        title="Записаться на курс"
        intro={`Оставьте контакты — свяжемся и откроем доступ к курсу «${name}».`}
      />
      <div className={s.page}>
        <section className={s.hero}>
          <div className={s.hero__inner}>
            <h1 className={s.title}>{name}</h1>
            {description && <p className={s.description}>{description}</p>}
            <button className={s.button} onClick={handleButtonClick}>
              {canOpen ? "Начать обучение" : "Получить доступ"}
            </button>
          </div>
        </section>

        <div className={s.statsRow}>
          <div className={s.blocks}>
            <Block
              title={`${moduleCount} ${pluralize(moduleCount, [
                "тема",
                "темы",
                "тем",
              ])}`}
              // subtitle="Познакомьтесь с темой"
            />
            <Block
              title={`${lessonCount} ${pluralize(lessonCount, [
                "урок",
                "урока",
                "уроков",
              ])}`}
              // subtitle="Начинающий"
            />
            {/* <Block
              title={
                <div style={{ display: "flex", alignItems: "center" }}>
                  4.6
                  <StarIcon
                    style={{ height: "16px", fill: "#0056d2", stroke: "none" }}
                  />
                </div>
              }
            /> */}
          </div>
        </div>

        <section className={s.content}>
          <h2 className={s.sectionTitle}>О курсе</h2>
          {/* <h3 className={s.content__subtitle}>Чему вы научитесь</h3>
          <div className={s.skills__container}>
            <Skill
              description={
                "Умение видеть лишние операции, простои, перепроизводство и оптимизировать процессы"
              }
            />
            <Skill
              description={
                "Анализ бизнес-процессов «от начала до конца» и поиска узких мест"
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
          </div> */}
          {program && (
            <>
              <h3 className={s.content__subtitle}>Программа курса</h3>
              <p className={s.program}>{program}</p>
            </>
          )}
          <h3 className={s.content__subtitle}>Приобретаемые навыки</h3>
          <div className={s.chips}>
            {skills && skills.length > 0 ? (
              skills.map(({ skill }) => <Chip key={skill.id} text={skill.name} />)
            ) : (
              <p className={s.chips__empty}>Навыки не указаны</p>
            )}
          </div>
        </section>
      </div>
    </>
  );
};

export default UI;
