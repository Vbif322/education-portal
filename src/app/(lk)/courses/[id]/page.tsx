import { FC } from "react";
import UI from "./ui";

type Props = {
  params: Promise<{ id: string }>;
};

const skills = [
  "Бережливое производство",
  "Оптимизация процессов",
  "Кайдзен",
  "Канбан",
  "5S",
  "Картирование потоков",
  "Управление изменениями",
  "Непрерывные улучшения",
  "Стандартизация процессов",
  "Анализ потерь",
  "Производственная эффективность",
  "Решение проблем",
];

const CoursePage: FC<Props> = async ({ params }) => {
  const { id } = await params;
  return <UI id={id} skills={skills} />;
};

export default CoursePage;
