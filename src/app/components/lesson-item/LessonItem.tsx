import { Lesson } from "@/app/@types/course";
import Paper from "@/app/ui/Paper/Paper";
import { FC } from "react";

type Props = {} & Partial<Lesson>;

const LessonItem: FC<Props> = ({ name }) => {
  return (
    <Paper>
      <p>{name}</p>
    </Paper>
  );
};

export default LessonItem;
