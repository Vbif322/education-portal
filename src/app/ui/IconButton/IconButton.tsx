import { ButtonHTMLAttributes, FC, ReactNode } from "react";
import s from "./style.module.css";

type Props = {
  children: ReactNode;
} & ButtonHTMLAttributes<HTMLButtonElement>;

const IconButton: FC<Props> = ({ children, className, ...props }) => {
  return (
    <button className={s.button + " " + className} {...props}>
      {children}
    </button>
  );
};

export default IconButton;
