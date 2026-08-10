import { FC, HTMLAttributes } from "react";
import Badge from "../Badge/Badge";

type Props = {
  text: string;
  /** @deprecated Используйте `Badge` с пропом `variant`. */
  backgroundColor?: string;
} & HTMLAttributes<HTMLSpanElement>;

/**
 * @deprecated Тонкая обёртка над `Badge` для старых вызовов.
 * В новом коде используйте `@/app/ui/Badge/Badge`.
 */
const Chip: FC<Props> = ({ text, backgroundColor, style, ...props }) => {
  return (
    <Badge
      style={backgroundColor ? { backgroundColor, ...style } : style}
      {...props}
    >
      {text}
    </Badge>
  );
};

export default Chip;
