import { DetailedHTMLProps, FC, HTMLAttributes } from "react";

type Props = {
  text: string;
  backgroundColor?: string;
} & DetailedHTMLProps<HTMLAttributes<HTMLDivElement>, HTMLDivElement>;

const Chip: FC<Props> = ({ text, backgroundColor = "#e8eef7", ...props }) => {
  return (
    <span
      style={{
        padding: "4px 8px",
        borderRadius: "16px",
        backgroundColor,
        ...props.style,
      }}
    >
      {text}
    </span>
  );
};

export default Chip;
