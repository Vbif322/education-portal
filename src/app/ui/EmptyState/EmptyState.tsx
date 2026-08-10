import { FC, HTMLAttributes, ReactNode } from "react";
import s from "./style.module.css";

type Props = {
  icon?: ReactNode;
  title: string;
  description?: ReactNode;
  /**
   * Кнопка или ссылка основного действия. Ссылки получают вид основного CTA,
   * можно передать пару элементов — они встанут в строку.
   */
  action?: ReactNode;
  /** Нумерованные шаги — для онбординга нового пользователя. */
  steps?: string[];
  /** `plain` — без рамки, когда состояние уже лежит внутри Paper. */
  variant?: "bordered" | "plain";
  /**
   * Тон медальона с иконкой: `brand` — обычное пустое состояние,
   * `neutral` — заглушка («в разработке», 404), `warning`/`danger` — ошибки.
   */
  tone?: "brand" | "neutral" | "warning" | "danger";
  /** `lg` — для отдельных страниц (404, error), `md` — для блоков внутри страницы. */
  size?: "md" | "lg";
  /** Центрирует состояние по высоте экрана — для страниц 404 и error. */
  fullPage?: boolean;
  /** Настоящий заголовок там, где это главное сообщение страницы. */
  titleAs?: "p" | "h1" | "h2" | "h3";
} & HTMLAttributes<HTMLDivElement>;

const toneClass = {
  brand: "toneBrand",
  neutral: "toneNeutral",
  warning: "toneWarning",
  danger: "toneDanger",
} as const;

const EmptyState: FC<Props> = ({
  icon,
  title,
  description,
  action,
  steps,
  variant = "bordered",
  tone = "brand",
  size = "md",
  fullPage = false,
  titleAs: Title = "p",
  className,
  ...props
}) => {
  const content = (
    <div
      className={[
        s.root,
        variant === "plain" ? s.plain : s.bordered,
        size === "lg" ? s.lg : null,
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      {...props}
    >
      {/* Иконка декоративная — смысл несёт заголовок. */}
      {icon && (
        <div className={`${s.icon} ${s[toneClass[tone]]}`} aria-hidden="true">
          {icon}
        </div>
      )}
      <Title className={s.title}>{title}</Title>
      {description && <p className={s.description}>{description}</p>}
      {steps && steps.length > 0 && (
        <ol className={s.steps}>
          {steps.map((step, i) => (
            <li key={i} className={s.step}>
              <span className={s.stepNumber}>{i + 1}</span>
              {step}
            </li>
          ))}
        </ol>
      )}
      {action && <div className={s.action}>{action}</div>}
    </div>
  );

  return fullPage ? <div className={s.viewport}>{content}</div> : content;
};

export default EmptyState;
