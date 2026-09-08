"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { useRouter } from "next/navigation";
import ContactDialog from "@/app/components/dialogs/contact-dialog";
import Button from "@/app/ui/Button/Button";
import { CTA_GOALS, LEAD_GOALS, reachGoal } from "@/app/lib/metrika";
import s from "../style.module.css";

/**
 * Единственный клиентский островок страницы курса.
 *
 * Кнопка «Получить доступ» стоит в трёх местах (герой, финальный блок, липкая
 * панель), а диалог заявки должен быть один: два смонтированных `ContactDialog`
 * означали бы две независимые формы и два состояния успеха. Поэтому состояние
 * живёт в провайдере, а кнопки — тонкие потребители контекста.
 *
 * Всё остальное содержимое страницы остаётся серверным и приходит сюда
 * через `children`.
 */

type CourseAccessValue = {
  /** Подпись кнопки: зависит от того, есть ли уже доступ. */
  label: string;
  activate: () => void;
  /** Герой отдаёт сюда свой узел — по нему решается показ липкой панели. */
  registerHeroCta: (node: HTMLElement | null) => void;
};

const CourseAccessContext = createContext<CourseAccessValue | null>(null);

function useCourseAccess(): CourseAccessValue {
  const value = useContext(CourseAccessContext);
  if (!value) {
    throw new Error("CourseAccessButton использован вне CourseAccessProvider");
  }
  return value;
}

type ProviderProps = {
  courseId: number;
  courseName: string;
  /** Доступ уже есть — роль, подписка или индивидуальная выдача. */
  canOpen: boolean;
  defaultEmail?: string;
  children: ReactNode;
};

export function CourseAccessProvider({
  courseId,
  courseName,
  canOpen,
  defaultEmail,
  children,
}: ProviderProps) {
  const router = useRouter();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [heroCta, setHeroCta] = useState<HTMLElement | null>(null);
  const [heroCtaVisible, setHeroCtaVisible] = useState(true);

  // Липкая панель нужна ровно тогда, когда кнопка героя ушла из виду.
  useEffect(() => {
    if (!heroCta) {
      return;
    }

    const observer = new IntersectionObserver(([entry]) =>
      setHeroCtaVisible(entry.isIntersecting)
    );
    observer.observe(heroCta);

    return () => observer.disconnect();
  }, [heroCta]);

  const activate = useCallback(() => {
    if (canOpen) {
      router.push(`/courses/${courseId}/lessons`);
      return;
    }

    // Цель отправляем только на этой ветке: студент, открывающий свои уроки,
    // конверсией по рекламе не является.
    reachGoal(CTA_GOALS.courseAccess, { courseId });
    setDialogOpen(true);
  }, [canOpen, courseId, router]);

  const value = useMemo<CourseAccessValue>(
    () => ({
      label: canOpen ? "Начать обучение" : "Получить доступ",
      activate,
      registerHeroCta: setHeroCta,
    }),
    [canOpen, activate]
  );

  return (
    <CourseAccessContext.Provider value={value}>
      <ContactDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        source="course"
        sourceId={String(courseId)}
        goal={LEAD_GOALS.course}
        defaultEmail={defaultEmail}
        title="Записаться на курс"
        intro={`Оставьте контакты — свяжемся и откроем доступ к курсу «${courseName}».`}
      />

      {children}

      {/* Панель рендерится только когда нужна: скрытая, но сфокусированная
          кнопка была бы ловушкой для клавиатуры и скринридера. */}
      {!canOpen && !heroCtaVisible && (
        <>
          <div className={s.stickyBarSpacer} aria-hidden="true" />
          <div className={s.stickyBar}>
            <span className={s.stickyBar__name}>{courseName}</span>
            <Button size="md" onClick={activate} className={s.stickyBar__button}>
              {value.label}
            </Button>
          </div>
        </>
      )}
    </CourseAccessContext.Provider>
  );
}

type ButtonProps = {
  /**
   * `hero` — кнопка первого экрана; её видимость управляет липкой панелью,
   * поэтому она оборачивается в наблюдаемый узел.
   */
  placement?: "hero" | "inline";
  fullWidth?: boolean;
};

export function CourseAccessButton({
  placement = "inline",
  fullWidth = false,
}: ButtonProps) {
  const { label, activate, registerHeroCta } = useCourseAccess();

  // Наблюдаем обёртку, а не саму кнопку: `ui/Button` — обычный FC без
  // forwardRef, ref в него не пробросить.
  return (
    <span
      ref={placement === "hero" ? registerHeroCta : undefined}
      className={s.ctaAnchor}
    >
      <Button size="lg" fullWidth={fullWidth} onClick={activate}>
        {label}
      </Button>
    </span>
  );
}
