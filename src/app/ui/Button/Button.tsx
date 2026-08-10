import { ButtonHTMLAttributes, FC } from "react";
import s from "./style.module.css";

type Props = {
  /**
   * `filled` — основное действие, `outline` — второстепенное,
   * `dark` — «Записаться» на карточке курса, `text` — плоская кнопка.
   */
  variant?: "text" | "filled" | "outline" | "dark";
  size?: "sm" | "md" | "lg";
  color?: "error";
  /** Показывает спиннер и блокирует кнопку на время перехода/запроса. */
  loading?: boolean;
  fullWidth?: boolean;
} & ButtonHTMLAttributes<HTMLButtonElement>;

const variantClass = {
  text: "text",
  filled: "filled",
  outline: "outline",
  dark: "dark",
} as const;

const sizeClass = { sm: "sm", md: "md", lg: "lg" } as const;

const Button: FC<Props> = ({
  children,
  className,
  variant = "filled",
  size = "md",
  color,
  loading = false,
  fullWidth = false,
  disabled,
  ...props
}) => {
  return (
    <button
      className={[
        s.button,
        s[variantClass[variant]],
        s[sizeClass[size]],
        color === "error" ? s.error : null,
        fullWidth ? s.fullWidth : null,
        loading ? s.loading : null,
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      {...props}
    >
      {loading && <span className={s.spinner} aria-hidden="true" />}
      {children}
    </button>
  );
};

export default Button;
