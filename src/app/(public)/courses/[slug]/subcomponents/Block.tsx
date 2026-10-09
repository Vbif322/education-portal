import { ReactNode } from "react";
import s from "./Block.module.css";

/**
 * Ячейка карточки фактов о курсе. Раскладку и разделители задаёт родительская
 * сетка (`.blocks` в стилях страницы) — ячейка знает только о своём содержимом.
 */
export const Block = ({
  icon,
  title,
  subtitle,
}: {
  icon?: ReactNode;
  title: string | ReactNode;
  subtitle?: string | ReactNode;
}) => {
  return (
    <div className={s.block}>
      {icon && (
        <span className={s.block__icon} aria-hidden="true">
          {icon}
        </span>
      )}
      <div className={s.block__title}>{title}</div>
      {subtitle && <div className={s.block__subtitle}>{subtitle}</div>}
    </div>
  );
};
