import Paper from "@/app/ui/Paper/Paper";
import s from "./style.module.css";
import Player from "@/app/components/video-player/Player";
import { getUser } from "@/app/lib/dal";

export default async function LessonPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const user = await getUser();
  const res = await fetch("http://localhost:3000/api/lessons/lesson", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ userId: user?.id, videoId: id }),
  });
  console.log(res, "res");
  return (
    <div className={s.container}>
      <div className={s.wrapper}>
        <Player
          source={{
            src: "/videos/Управление задачами 12.mp4",
            type: "video/mp4",
          }}
          controls
        />
        <p className={s.title}></p>
        <Paper>
          <p className={s.title}>Описание</p>
          <p className={s.text}>
            Важна систематизация работы с задачами, как части операционного
            менеджмента, для эффективного управления ресурсами, реализации
            проектов, решения проблем, достижения целей
          </p>
        </Paper>
        <Paper>
          <p className={s.title}>Материалы</p>
          <div className={s.material__container}>
            <a href="#" className="link">
              Презентация
            </a>
            <a href="#" className="link">
              Контрольный лист
            </a>
          </div>
        </Paper>
      </div>
    </div>
  );
}
