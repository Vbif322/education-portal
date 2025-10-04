import { FC, HTMLAttributes } from "react";

type Props = {
  value: number;
  color?: string;
  backgroundColor?: string;
} & HTMLAttributes<HTMLDivElement>;

const Progress: FC<Props> = ({
  value,
  color = "#2196F3",
  backgroundColor = "#E0E0E0",
  ...props
}) => {
  const normalizedValue = Math.max(0, Math.min(100, value));

  const { style, ...other } = props;
  return (
    <div
      style={{
        width: "100%",
        height: `${4}px`,
        backgroundColor: backgroundColor,
        borderRadius: `${4 / 2}px`, // Делаем края закругленными
        overflow: "hidden", // Обрезаем внутреннюю полосу по границе
        ...style,
      }}
      role="progressbar" // Роль для доступности (Accessibility)
      aria-valuenow={normalizedValue}
      aria-valuemin={0}
      aria-valuemax={100}
      {...other}
    >
      <div
        style={{
          width: `${normalizedValue}%`,
          height: "100%",
          backgroundColor: color,
          transition: "width 0.3s",
        }}
      />
    </div>
  );
};

export default Progress;
