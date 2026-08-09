import { FC, HTMLAttributes, ReactNode } from "react";
import s from "./style.module.css";

export type BadgeVariant =
  | "neutral"
  | "primary"
  | "success"
  | "warning"
  | "danger";

type Props = {
  /** Иконка слева от текста (обычно lucide-react, размер 12–14). */
  icon?: ReactNode;
  variant?: BadgeVariant;
  children: ReactNode;
} & HTMLAttributes<HTMLSpanElement>;

const variantClass: Record<BadgeVariant, string> = {
  neutral: s.neutral,
  primary: s.primary,
  success: s.success,
  warning: s.warning,
  danger: s.danger,
};

const Badge: FC<Props> = ({
  icon,
  variant = "neutral",
  children,
  className,
  ...props
}) => {
  return (
    <span
      className={[s.badge, variantClass[variant], className]
        .filter(Boolean)
        .join(" ")}
      {...props}
    >
      {icon && <span className={s.icon}>{icon}</span>}
      {children}
    </span>
  );
};

export default Badge;
