import { FC, HTMLAttributes } from "react";
import s from "./style.module.css";

type Props = {
  /** Процент заполнения, 0–100. Значения за пределами обрезаются. */
  value: number;
  size?: "sm" | "md";
  tone?: "primary" | "success";
  /** Доступное имя: без него полоса читается скринридером без контекста. */
  label?: string;
} & HTMLAttributes<HTMLDivElement>;

const Progress: FC<Props> = ({
  value,
  size = "sm",
  tone = "primary",
  label,
  className,
  ...props
}) => {
  const normalizedValue = Math.max(0, Math.min(100, Math.round(value)));

  return (
    <div
      className={[s.track, s[size], className].filter(Boolean).join(" ")}
      role="progressbar"
      aria-valuenow={normalizedValue}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label={label}
      {...props}
    >
      <div
        className={[s.fill, tone === "success" ? s.success : null]
          .filter(Boolean)
          .join(" ")}
        style={{ width: `${normalizedValue}%` }}
      />
    </div>
  );
};

export default Progress;
