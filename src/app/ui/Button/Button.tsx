import { ButtonHTMLAttributes, FC } from "react";
import s from "./style.module.css";

type Props = {
  variant?: "text" | "filled";
} & ButtonHTMLAttributes<HTMLButtonElement>;

const Button: FC<Props> = ({
  children,
  className,
  variant = "filled",
  ...props
}) => {
  const variantClass = variant === "filled" ? s.filled : s.text;
  return (
    <button className={`${s.button} ${variantClass} ${className}`} {...props}>
      {children}
    </button>
  );
};

export default Button;
