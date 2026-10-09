import "server-only";

import { notFound, permanentRedirect } from "next/navigation";
import {
  getCourseById,
  getCourseBySlug,
  getCourseSlugById,
} from "@/app/lib/dal/course.dal";

/**
 * До перехода на slug адреса курсов были числовыми (/courses/12/…), и они
 * остались в рекламе и закладках. Числовой сегмент — это старый id; чисто
 * цифровой slug запрещён (`isValidSlug`), так что путаницы нет.
 */
function isLegacyId(param: string) {
  return /^\d+$/.test(param);
}

/**
 * Курс по сегменту `/courses/[slug]` для страницы: старый id отвечает 308 на
 * тот же путь со slug. `rest` — хвост пути после сегмента курса.
 */
export async function resolveCourse(param: string, rest = "") {
  if (isLegacyId(param)) {
    const slug = await getCourseSlugById(Number(param));
    if (!slug) notFound();
    permanentRedirect(`/courses/${slug}${rest}`);
  }
  return getCourseBySlug(param);
}

/**
 * То же без редиректа — для layout. Он не видит хвост пути и, редиректя сам,
 * терял бы номер урока; редиректит страница внутри, а layout пока просто
 * рисует тот же курс.
 */
export function findCourse(param: string) {
  return isLegacyId(param)
    ? getCourseById(Number(param))
    : getCourseBySlug(param);
}
