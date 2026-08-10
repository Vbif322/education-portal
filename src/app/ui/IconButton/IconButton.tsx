import { ButtonHTMLAttributes, FC, ReactNode } from "react";
import s from "./style.module.css";

type Props = {
  children: ReactNode;
  /**
   * Обязателен: кнопка содержит только иконку, без него скринридер
   * объявляет её безымянной.
   */
  "aria-label": string;
} & ButtonHTMLAttributes<HTMLButtonElement>;

const IconButton: FC<Props> = ({ children, className, ...props }) => {
  return (
    <button
      type="button"
      className={[s.button, className].filter(Boolean).join(" ")}
      {...props}
    >
      {children}
    </button>
  );
};

export default IconButton;
