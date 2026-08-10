import { CSSProperties, FC, HTMLAttributes } from "react";
import s from "./style.module.css";

type Props = {
  /** `text` — строка текста, `card` — плитка курса, `row` — строка таблицы. */
  variant?: "text" | "card" | "row" | "block";
  width?: CSSProperties["width"];
  height?: CSSProperties["height"];
} & HTMLAttributes<HTMLDivElement>;

const Skeleton: FC<Props> = ({
  variant = "text",
  width,
  height,
  className,
  style,
  ...props
}) => {
  return (
    <div
      className={[s.skeleton, s[variant], className].filter(Boolean).join(" ")}
      style={{ width, height, ...style }}
      aria-hidden="true"
      {...props}
    />
  );
};

export default Skeleton;
