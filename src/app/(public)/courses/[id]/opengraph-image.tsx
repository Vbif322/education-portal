import { ImageResponse } from "next/og";
import { getCourseById } from "@/app/lib/dal/course.dal";

/**
 * Картинка ссылки для соцсетей и мессенджеров.
 *
 * Готового OG-изображения в `public/` нет, а по рекламе ссылку на курс
 * пересылают — без картинки превью выглядит пустым. Рисуем её из данных курса
 * через `next/og`: это часть Next, новых зависимостей не требуется.
 */

export const alt = "Курс Кирилла Месеняшина";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

type Props = {
  params: { id: string };
};

export default async function Image({ params }: Props) {
  const courseId = Number.parseInt(params.id, 10);
  const course = Number.isNaN(courseId) ? null : await getCourseById(courseId);

  const title = course?.name ?? "Курсы по менеджменту";
  const subtitle =
    course?.outcome ??
    course?.description ??
    "Видеокурсы для руководителей и специалистов";

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: 80,
          background: "linear-gradient(135deg, #e2ecfb 0%, #ffffff 60%)",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", fontSize: 30, color: "#0056d2" }}>
          Бизнес с Кириллом Месеняшиным
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          <div
            style={{
              display: "flex",
              fontSize: 64,
              fontWeight: 700,
              color: "#111827",
              lineHeight: 1.15,
            }}
          >
            {title}
          </div>
          <div
            style={{
              display: "flex",
              fontSize: 30,
              color: "#4b5563",
              lineHeight: 1.4,
            }}
          >
            {/* Длинный текст обрезаем сами: в макете OG нет переполнения. */}
            {subtitle.length > 160 ? `${subtitle.slice(0, 157)}…` : subtitle}
          </div>
        </div>

        <div style={{ display: "flex", fontSize: 26, color: "#6b7280" }}>
          Видеокурс в записи · доступ в личном кабинете
        </div>
      </div>
    ),
    size
  );
}
