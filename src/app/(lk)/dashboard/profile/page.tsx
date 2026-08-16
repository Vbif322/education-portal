import { redirect } from "next/navigation";
import { Metadata } from "next";
import { CreditCard } from "lucide-react";

import SettingBlock from "@/app/components/setting-block/setting-block";
import Badge from "@/app/ui/Badge/Badge";
import EmptyState from "@/app/ui/EmptyState/EmptyState";
import Paper from "@/app/ui/Paper/Paper";
import { getUser, getUserSubscription } from "@/app/lib/dal";
import { getAllCourses, getCoursesProgress } from "@/app/lib/dal/course.dal";
import {
  formatSubscriptionDate,
  getSubscriptionStatus,
} from "@/app/utils/subscription";
import RequestAccessButton from "./request-access-button";
import s from "./style.module.css";

export const metadata: Metadata = {
  title: "Профиль",
};

export default async function ProfilePage() {
  const user = await getUser();

  // Раньше здесь был общий `return;` на оба случая — пользователь без
  // подписки получал белую страницу.
  if (user === null) {
    redirect("/login");
  }

  const [userSub, allCourses] = await Promise.all([
    getUserSubscription(),
    getAllCourses(),
  ]);

  // Счётчики выводятся из одного прогресса, доступ для них не нужен: курсы без
  // активности приходят с нулями и не проходят фильтры ниже. Раньше список
  // ограничивался «зачислениями» (`usersToCourses`) — модель, не связанная с
  // реальным доступом, из-за чего цифры расходились с дашбордом.
  const progressMap = await getCoursesProgress(
    allCourses.map((course) => course.id)
  );

  const progressValues = [...progressMap.values()];
  const stats = {
    inProgress: progressValues.filter(
      (p) => p.percentage > 0 && p.percentage < 100
    ).length,
    completed: progressValues.filter((p) => p.percentage === 100).length,
    lessonsDone: progressValues.reduce((sum, p) => sum + p.completed, 0),
  };

  const subStatus = userSub ? getSubscriptionStatus(userSub) : null;

  return (
    <div className={s.page}>
      <h1 className={s.pageTitle}>Профиль</h1>

      <SettingBlock
        title="Основные"
        rows={[{ text1: "Логин", text2: user.email }]}
      />

      {userSub && subStatus ? (
        <SettingBlock
          title="Подписка"
          action={
            subStatus.state !== "active" ? (
              <RequestAccessButton
                email={user.email}
                label="Продлить"
                dialogTitle="Продление подписки"
              />
            ) : undefined
          }
          rows={[
            { text1: "Тариф", text2: userSub.type || "—" },
            {
              text1: "Статус",
              text2: (
                <Badge variant={subStatus.variant}>{subStatus.label}</Badge>
              ),
            },
            {
              text1: "Дата окончания",
              text2: formatSubscriptionDate(userSub.endedAt),
            },
          ]}
        />
      ) : (
        <section className={s.block}>
          <h2 className={s.blockTitle}>Подписка</h2>
          <Paper className={s.emptyPaper}>
            <EmptyState
              variant="plain"
              icon={<CreditCard size={28} />}
              title="Подписка не оформлена"
              description="Доступ к урокам открывается по подписке или по отдельному доступу к курсу. Оставьте заявку — свяжемся и подберём вариант."
              action={
                <RequestAccessButton
                  email={user.email}
                  label="Получить доступ"
                  dialogTitle="Доступ к курсам"
                />
              }
            />
          </Paper>
        </section>
      )}

      <section className={s.block}>
        <h2 className={s.blockTitle}>Моё обучение</h2>
        <div className={s.stats}>
          <Paper className={s.stat}>
            <span className={s.statValue}>{stats.inProgress}</span>
            <span className={s.statLabel}>курсов в процессе</span>
          </Paper>
          <Paper className={s.stat}>
            <span className={s.statValue}>{stats.completed}</span>
            <span className={s.statLabel}>курсов пройдено</span>
          </Paper>
          <Paper className={s.stat}>
            <span className={s.statValue}>{stats.lessonsDone}</span>
            <span className={s.statLabel}>уроков завершено</span>
          </Paper>
        </div>
      </section>
    </div>
  );
}
