import Paper from "@/app/ui/Paper/Paper";
import s from "./style.module.css";
import Player from "@/app/components/video-player/Player";
import { addLessonToUser, getLesson } from "@/app/lib/dal/lesson.dal";
import { cache } from "react";
import ContactModal from "./contact-modal";
import { analyticsService } from "@/lib/analytics/analytics.service";
import { getUser } from "@/app/lib/dal";
import { redirect } from "next/navigation";
import { after } from "next/server";

const getLessonCached = cache(getLesson);

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const lesson = await getLessonCached(Number(id));
  if (!lesson) {
    return {
      title: "Урок не найден",
    };
  }
  return {
    title: lesson.name,
    description: lesson.description,
  };
}

export default async function LessonPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await getUser();
  if (!user) {
    redirect("/login")
  }
  const { id } = await params;

  // Логируем попытку доступа (до проверок)
  after(() =>
    analyticsService
      .trackActivity({
        userId: user.id,
        activityType: "lesson_access_attempt",
        resourceType: "lesson",
        resourceId: id
      })
      .catch((err) => console.error("Analytics tracking failed:", err))
  );

  const lesson = await getLessonCached(Number(id));

  if (!lesson) {
    return <p>Такой урок не найден</p>;
  }
  const forbidden = "forbidden" in lesson ? true : false;

  const materials =
    "materials" in lesson && Array.isArray(lesson.materials)
      ? (lesson.materials as { id: number; name: string; url: string }[])
      : [];

  // Логируем успешный просмотр (только если есть доступ)
  if (!forbidden) {
    after(() =>
      addLessonToUser(Number(id)).catch((err) =>
        console.error("Failed to add lesson to user:", err)
      )
    );

    after(() =>
      analyticsService
        .trackActivity({
          userId: user.id,
          activityType: "lesson_view",
          resourceType: "lesson",
          resourceId: id
        })
        .catch((err) => console.error("Analytics tracking failed:", err))
    );
  }

  return (
    <>
      <div className={s.container}>
        <div className={s.bg}></div>
        <div className={s.wrapper}>
          {forbidden && (
            <ContactModal lessonId={Number(id)} userEmail={user.email} />
          )}
          <Player lessonId={lesson.id} />
          <p className={s.title}>{lesson.name}</p>
          <Paper style={{ width: "100%" }}>
            <p className={s.title}>Описание</p>
            <p className={s.text}>{lesson.description}</p>
          </Paper>
          {/* Материалы показываются только при открытом доступе. Раньше
              условие было инвертировано (`forbidden`), а ссылки вели на "#". */}
          {!forbidden && materials.length > 0 && (
            <Paper style={{ width: "100%" }}>
              <p className={s.title}>Материалы</p>
              <div className={s.material__container}>
                {materials.map((material) => (
                  <a
                    key={material.id}
                    href={material.url}
                    className="link"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {material.name}
                  </a>
                ))}
              </div>
            </Paper>
          )}
        </div>
      </div>
    </>
  );
}
