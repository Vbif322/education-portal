import { ReactNode } from "react";
import s from "./Block.module.css";

export const Block = ({
  title,
  subtitle,
}: {
  title: string | ReactNode;
  subtitle?: string | ReactNode;
}) => {
  return (
    <div className={s.block}>
      <div className={s.block__title}>{title}</div>
      {subtitle && <div>{subtitle}</div>}
    </div>
  );
};
