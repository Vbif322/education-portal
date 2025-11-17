"use client";
import { FC, useState } from "react";
import { Block } from "./subcomponents/Block";
import s from "./style.module.css";
import { useRouter } from "next/navigation";
import { Skill } from "./subcomponents/Skill";
import Chip from "@/app/ui/Chip/Chip";
import { enrollUserInCourse } from "@/app/actions/courses";
import { CourseWithMetadata } from "@/@types/course";
import { pluralize } from "@/app/utils/helpers";
import Dialog from "@/app/ui/Dialog/Dialog";

type Props = {
  skills?: Array<{
    skill: {
      id: number;
      name: string;
      createdAt: Date;
      updatedAt: Date;
    };
  }>;
  isEnrolled: boolean;
  user: {
    id: string;
    email: string;
    role: "user" | "admin";
  } | null;
} & CourseWithMetadata;

const UI: FC<Props> = ({
  skills,
  isEnrolled,
  id,
  name,
  description,
  moduleCount,
  lessonCount,
  program,
  user
}) => {
  const router = useRouter();
  const [isEnrolling, setIsEnrolling] = useState(false);
  const [open, setOpen] = useState(false);

  const handleEnroll = async () => {
    setIsEnrolling(true);
    try {
      const result = await enrollUserInCourse(id);
      if (result.success) {
        router.push(id + "/lessons");
      } else {
        alert(result.error || "Не удалось записаться на курс");
      }
    } catch (error) {
      console.error("Ошибка при записи на курс:", error);
      alert("Произошла ошибка при записи на курс");
    } finally {
      setIsEnrolling(false);
    }
  };

  const handleButtonClick = () => {
    if (!user || user.role !== 'admin') {
      setOpen(true)
    } else {
      if (isEnrolled) {
        router.push(id + "/lessons");
      } else {
        handleEnroll();
      }
    }

  };

  return (
    <>
    <Dialog open={open} onClose={()=>setOpen(false)}>
    {/* <div>
      <h3 style={{fontWeight: 'normal'}}>Для доступа необходимо связаться по почте <b>mesenyashin@mail.ru</b> или по телефону <b>+7 812 467-34-67</b></h3>
    </div> */}
     <div className={s.contactDialog}>
    <h3 className={s.dialogTitle}>Для доступа к курсу</h3>
    <p className={s.dialogText}>
      Пожалуйста, свяжитесь с нами одним из способов:
    </p>
    <div className={s.contactMethods}>
      <p className={s.contactLink}>
        📧 mesenyashin@mail.ru
      </p>
      <p className={s.contactLink}>
        📞 +7 812 467-34-67
      </p>
    </div>
  </div>
    </Dialog>
    <div className={s.container}>
      <div className={s.blocks}>
        <Block
          title={`${moduleCount} ${pluralize(moduleCount, [
            "модуль",
            "модуля",
            "модулей",
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
          lastElement
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
          lastElement
        /> */}
      </div>
      <div className={s.wrapper}>
        <div className={s.hero}>
          <div className={s.background}></div>
          <h1 className={s.title}>{name}</h1>
          {description && <p className={s.description}>{description}</p>}
          <button
            className={s.button}
            onClick={handleButtonClick}
            disabled={isEnrolling}
          >
            {isEnrolling
              ? "Записываемся..."
              : isEnrolled
                ? "Начать обучение"
                : "Записаться на курс"}
          </button>
        </div>
        <div className={s.content}>
          <h2 className={s.sectionTitle}>О курсе</h2>
          <h3 className={s.content__subtitle}>Чему вы научитесь</h3>
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
          </div>
          <h3 className={s.content__subtitle}>Получаемые навыки</h3>
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: "8px",
              marginTop: "16px",
            }}
          >
            {skills && skills.length > 0 ? (
              skills.map(({ skill }) => (
                <Chip key={skill.id} text={skill.name} />
              ))
            ) : (
              <p style={{ color: "#666" }}>Навыки не указаны</p>
            )}
          </div>
          {program && <div>
            <h3 className={s.content__subtitle}>Программа курса</h3>
            <p style={{ marginTop: '16px' }}>{program}</p>
          </div>}
        </div>
      </div>
    </div>
    </>
  );
};

export default UI;
