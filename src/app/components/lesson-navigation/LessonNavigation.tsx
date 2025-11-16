"use client";

import { FC } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import Button from "@/app/ui/Button/Button";
import s from "./LessonNavigation.module.css";

interface LessonNavigationProps {
  lessonTitle: string;
  currentLesson: number;
  totalLessons: number;
  onPrevious?: () => void;
  onNext?: () => void;
}

const LessonNavigation: FC<LessonNavigationProps> = ({
  lessonTitle,
  currentLesson,
  totalLessons,
  onPrevious,
  onNext,
}) => {
  const isFirst = currentLesson === 1;
  const isLast = currentLesson === totalLessons;

  return (
    <div className={s.container}>
      <div className={s.header}>
        <h3 className={s.title}>{lessonTitle}</h3>
        <span className={s.progress}>
          Урок {currentLesson} из {totalLessons}
        </span>
      </div>
      <div className={s.buttons}>
        <Button
          variant="text"
          onClick={onPrevious}
          disabled={isFirst}
          className={s.button}
        >
          <ChevronLeft size={20} />
          Назад
        </Button>
        <Button
          variant="filled"
          onClick={onNext}
          disabled={isLast}
          className={s.button}
        >
          Следующий
          <ChevronRight size={20} />
        </Button>
      </div>
    </div>
  );
};

export default LessonNavigation;
