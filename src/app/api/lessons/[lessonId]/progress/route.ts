import { NextRequest, NextResponse } from "next/server";
import {
  getLessonProgress,
  updateLessonProgress,
  completeLessonProgress,
  canAccessLesson,
} from "@/app/lib/dal/lesson.dal";
import { getUser } from "@/app/lib/dal";
import { revalidatePath } from "next/cache";
import { analyticsService } from "@/lib/analytics/analytics.service";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ lessonId: string }> }
) {
  try {
    const user = await getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { lessonId: rawLessonId } = await params;
    const lessonId = Number(rawLessonId);
    if (!Number.isInteger(lessonId) || lessonId <= 0) {
      return NextResponse.json(
        { error: "Некорректный идентификатор урока" },
        { status: 400 }
      );
    }

    if (!(await canAccessLesson(lessonId, user))) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const progress = await getLessonProgress(lessonId);

    return NextResponse.json({
      currentTime: progress?.currentTime || 0,
      duration: progress?.duration || 0,
      completed: !!progress?.completedAt,
    });
  } catch (error) {
    console.error("Error fetching lesson progress:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ lessonId: string }> }
) {
  try {
    const user = await getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { lessonId: rawLessonId } = await params;
    const lessonId = Number(rawLessonId);
    if (!Number.isInteger(lessonId) || lessonId <= 0) {
      return NextResponse.json(
        { error: "Некорректный идентификатор урока" },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { currentTime, duration, completed } = body;

    if (typeof currentTime !== "number" || typeof duration !== "number") {
      return NextResponse.json(
        { error: "Invalid request body" },
        { status: 400 }
      );
    }

    if (!(await canAccessLesson(lessonId, user))) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Сохраняем прогресс
    await updateLessonProgress(lessonId, currentTime, duration);

    // Определяем тип события для аналитики
    const eventType = completed === true ? "video_complete" : "progress_save";

    // Отслеживаем событие видео (асинхронно, не блокируя ответ)
    analyticsService
      .trackVideoEvent({
        userId: user.id,
        lessonId: lessonId,
        eventType,
        currentTime,
        duration,
        userAgent: request.headers.get("user-agent") || undefined,
      })
      .catch((err) => console.error("Analytics tracking failed:", err));

    // Если урок завершен (90% просмотра), отмечаем его
    if (completed === true) {
      await completeLessonProgress(lessonId);

      // Ревалидация пути для обновления прогресса в sidebar
      const courseIdMatch = request.headers
        .get("referer")
        ?.match(/\/courses\/(\d+)\//);
      if (courseIdMatch) {
        const courseId = courseIdMatch[1];
        revalidatePath(`/courses/${courseId}/lessons`);
      }
    }
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error saving lesson progress:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
