import { ButtonHTMLAttributes, FC } from "react";
import s from "./style.module.css";

type Props = {
  variant?: "text" | "filled";
  color?: "error";
} & ButtonHTMLAttributes<HTMLButtonElement>;

const Button: FC<Props> = ({
  children,
  className,
  variant = "filled",
  color,
  ...props
}) => {
  const variantClass = variant === "filled" ? s.filled : s.text;
  const colorClass = color === "error" ? s.error : "";
  return (
    <button
      className={`${s.button} ${variantClass} ${colorClass} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};

export default Button;
