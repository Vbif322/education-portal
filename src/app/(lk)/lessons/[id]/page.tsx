import Paper from "@/app/ui/Paper/Paper";
import s from "./style.module.css";
import Player from "@/app/components/video-player/Player";
import { addLessonToUser, getLesson } from "@/app/lib/dal/lesson.dal";

export default async function LessonPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  addLessonToUser(Number(id));

  const lesson = await getLesson(Number(id));
  if (!lesson) {
    return <p>Такой урок не найден</p>;
  }
  // console.log(lesson);

  const videoRes = await fetch(
    process.env.BASE_URL + "/api/videos/?name=" + lesson.videoURL
  );
  // const videoData = await videoRes.json();
  // console.log(videoRes);

  return (
    <div className={s.container}>
      <div className={s.bg}></div>
      <div className={s.wrapper}>
        <Player
          source={{
            src: "/videos/Управление задачами 12.mp4",
            type: "video/mp4",
          }}
          controls
        />
        <p className={s.title}>{lesson.name}</p>
        <Paper>
          <p className={s.title}>Описание</p>
          <p className={s.text}>{lesson.description}</p>
        </Paper>
        {lesson.materials.length > 0 && (
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
        )}
      </div>
    </div>
  );
}
