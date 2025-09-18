import { FC, HTMLAttributes, ReactNode } from "react";
import s from "./style.module.css";

type Props = {
  children?: ReactNode;
} & HTMLAttributes<HTMLDivElement>;

const Paper: FC<Props> = ({ children, className, ...props }) => {
  return (
    <div className={s.container + " " + className} {...props}>
      {children}
    </div>
  );
};

export default Paper;
