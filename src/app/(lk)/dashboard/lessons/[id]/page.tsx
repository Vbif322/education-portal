import Paper from "@/app/ui/Paper/Paper";
import s from "./style.module.css";
import Player from "@/app/components/video-player/Player";
import { addLessonToUser, getLesson } from "@/app/lib/dal/lesson.dal";
import Button from "@/app/ui/Button/Button";

export default async function LessonPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const lesson = await getLesson(Number(id));
  if (!lesson) {
    return <p>Такой урок не найден</p>;
  }
  const forbidden = "forbidden" in lesson ? true : false;

  if (!forbidden) {
    addLessonToUser(Number(id));
  }

  return (
    <div className={s.container}>
      <div className={s.bg}></div>
      <div className={s.wrapper}>
        {forbidden && (
          <div className={s.forbidden}>
            <Paper className={s.modal}>
              <p>Для просмотра требуется подписка</p>
              <Button>Открыть доступ</Button>
            </Paper>
          </div>
        )}
        <Player videoId={forbidden ? "" : lesson.videoURL} />
        <p className={s.title}>{lesson.name}</p>
        <Paper style={{ width: "100%" }}>
          <p className={s.title}>Описание</p>
          <p className={s.text}>{lesson.description}</p>
        </Paper>
        {"materials" in lesson &&
          Array.isArray(lesson.materials) &&
          lesson.materials.length > 0 &&
          forbidden && (
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
