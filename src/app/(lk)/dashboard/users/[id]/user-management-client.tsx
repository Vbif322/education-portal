"use client";

import { FC, useState } from "react";
import Paper from "@/app/ui/Paper/Paper";
import Button from "@/app/ui/Button/Button";
import Chip from "@/app/ui/Chip/Chip";
import Dialog from "@/app/ui/Dialog/Dialog";
import s from "./style.module.css";
import { Subscription, UserWithSubscription } from "@/@types/user";
import {
  updateSubscription,
  grantCourseAccess,
  revokeCourseAccess,
  grantLessonAccess,
  revokeLessonAccess,
  changeUserRole,
} from "./actions";
import { Course, Lesson } from "@/@types/course";
import AccessDialog from "./AccessDialog";

type CourseAccess = {
  courseId: number;
  courseName: string;
  grantedAt: Date;
  expiresAt: Date | null;
};

type LessonAccess = {
  lessonId: number;
  lessonName: string;
  grantedAt: Date;
  expiresAt: Date | null;
};

type Props = {
  user: UserWithSubscription;
  courseAccess: CourseAccess[];
  lessonAccess: LessonAccess[];
  allCourses: Course[];
  allLessons: Lesson[];
  lessonsFromCourses: {lessons: Lesson[], courseId: Course['id']}[]
};

const UserManagementClient: FC<Props> = ({
  user,
  courseAccess,
  lessonAccess,
  allCourses,
  allLessons,
  lessonsFromCourses
}) => {
  const [subscriptionDialogOpen, setSubscriptionDialogOpen] = useState(false);
  const [courseDialogOpen, setCourseDialogOpen] = useState(false);
  const [lessonDialogOpen, setLessonDialogOpen] = useState(false);
  const [roleDialogOpen, setRoleDialogOpen] = useState(false);

  // Subscription form state
  const [subscriptionType, setSubscriptionType] = useState<Subscription['type']>(
    user.subscription?.type
  );
  const [subscriptionEndDate, setSubscriptionEndDate] = useState<string>(
    user.subscription?.endedAt
      ? new Date(user.subscription.endedAt).toISOString().split("T")[0]
      : ""
  );

  // Course access form state
  const [selectedCourses, setSelectedCourses] = useState<number[]>([]);
  const [courseExpiresAt, setCourseExpiresAt] = useState<string>("");

  // Lesson access form state
  const [selectedLessons, setSelectedLessons] = useState<number[]>([]);
  const [lessonExpiresAt, setLessonExpiresAt] = useState<string>("");

  // Role form state
  const [selectedRole, setSelectedRole] = useState<string>(user.role);

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString("ru-RU", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  const isSubscriptionActive = (endDate: Date) => {
    return new Date(endDate).getTime() > new Date().getTime();
  };

  const handleSubscriptionSubmit = async () => {
    if (!subscriptionEndDate) return;
    if (subscriptionType === null) return;
    await updateSubscription(user.id, subscriptionType, new Date(subscriptionEndDate));
    setSubscriptionDialogOpen(false);
    window.location.reload();
  };

  const handleGrantCourseAccess = async () => {
    if (selectedCourses.length === 0) return;
    const expiresAt = courseExpiresAt ? new Date(courseExpiresAt) : null;
    for (const courseId of selectedCourses) {
      await grantCourseAccess(user.id, courseId, expiresAt);
    }
    setCourseDialogOpen(false);
    setSelectedCourses([]);
    setCourseExpiresAt("");
    window.location.reload();
  };

  const handleCourseCheckboxChange = (courseId: number, checked: boolean) => {
    if (checked) {
      setSelectedCourses((prev) => [...prev, courseId]);
    } else {
      setSelectedCourses((prev) => prev.filter((id) => id !== courseId));
    }
  };

  const handleRevokeCourseAccess = async (courseId: number) => {
    await revokeCourseAccess(user.id, courseId);
    window.location.reload();
  };

  const handleGrantLessonAccess = async () => {
    if (selectedLessons.length === 0) return;
    const expiresAt = lessonExpiresAt ? new Date(lessonExpiresAt) : null;
    for (const lessonId of selectedLessons) {
      await grantLessonAccess(user.id, lessonId, expiresAt);
    }
    setLessonDialogOpen(false);
    setSelectedLessons([]);
    setLessonExpiresAt("");
    window.location.reload();
  };

  const handleLessonCheckboxChange = (lessonId: number, checked: boolean) => {
    if (checked) {
      setSelectedLessons((prev) => [...prev, lessonId]);
    } else {
      setSelectedLessons((prev) => prev.filter((id) => id !== lessonId));
    }
  };

  const handleRevokeLessonAccess = async (lessonId: number) => {
    await revokeLessonAccess(user.id, lessonId);
    window.location.reload();
  };

  const handleRoleChange = async () => {
    await changeUserRole(user.id, selectedRole as "user" | "admin");
    setRoleDialogOpen(false);
    window.location.reload();
  };

  const hasActiveSubscription = user.subscription
    ? isSubscriptionActive(user.subscription.endedAt)
    : false;

  // Filter out courses that user already has access to
  const availableCourses = allCourses.filter(
    (course) => !courseAccess.some((access) => access.courseId === course.id)
  );

  // Filter out lessons that user already has access to and lessons from courses
  const lessonIdsFromCourses = lessonsFromCourses.flatMap(({ lessons }) => lessons.map(l => l.id));
  const availableLessons = allLessons.filter(
    (lesson) => !lessonAccess.some((access) => access.lessonId === lesson.id) &&
                !lessonIdsFromCourses.includes(lesson.id)
  );

  return (
    <div className={s.container}>
      <h1 className={s.title}>Управление пользователем</h1>

      {/* User Info Section */}
      <Paper className={s.section}>
        <div className={s.section__header}>
          <h2 className={s.section__title}>Основная информация</h2>
          {/* <Button variant="text" onClick={() => setRoleDialogOpen(true)}>
            Изменить роль
          </Button> */}
        </div>
        <div className={s.info__grid}>
          <div className={s.info__item}>
            <span className={s.info__label}>Email</span>
            <span className={s.info__value}>{user.email}</span>
          </div>
          <div className={s.info__item}>
            <span className={s.info__label}>Роль</span>
            <Chip
              text={user.role === "admin" ? "Администратор" : "Пользователь"}
              backgroundColor={user.role === "admin" ? "#fef3c7" : "#e8eef7"}
            />
          </div>
        </div>
      </Paper>

      {/* Subscription Section */}
      <Paper className={s.section}>
        <div className={s.section__header}>
          <h2 className={s.section__title}>Подписка</h2>
          <Button variant="text" onClick={() => setSubscriptionDialogOpen(true)}>
            {user.subscription ? "Изменить" : "Добавить"}
          </Button>
        </div>
        {user.subscription ? (
          <div className={s.info__grid}>
            <div className={s.info__item}>
              <span className={s.info__label}>Тип подписки</span>
              <Chip
                text={user.subscription.type || "Ознакомительная"}
                backgroundColor={
                  user.subscription.type === "Все включено" ? "#d1fae5" : "#e8eef7"
                }
              />
            </div>
            <div className={s.info__item}>
              <span className={s.info__label}>Дата окончания</span>
              <span className={s.info__value}>
                {formatDate(user.subscription.endedAt)}
              </span>
            </div>
            <div className={s.info__item}>
              <span className={s.info__label}>Статус</span>
              <Chip
                text={hasActiveSubscription ? "Активна" : "Истекла"}
                backgroundColor={hasActiveSubscription ? "#d1fae5" : "#fee2e2"}
              />
            </div>
          </div>
        ) : (
          <p className={s.empty__text}>Подписка отсутствует</p>
        )}
      </Paper>

      {/* Course Access Section */}
      <Paper className={s.section}>
        <div className={s.section__header}>
          <h2 className={s.section__title}>Доступ к курсам</h2>
          <Button variant="text" onClick={() => setCourseDialogOpen(true)}>
            Добавить доступ
          </Button>
        </div>
        {courseAccess.length > 0 ? (
          <div className={s.access__list}>
            {courseAccess.map((access) => (
              <div key={access.courseId} className={s.access__item}>
                <div className={s.access__info}>
                  <span className={s.access__name}>{access.courseName}</span>
                  <span className={s.access__date}>
                    Выдан: {formatDate(access.grantedAt)}
                    {access.expiresAt && ` • До: ${formatDate(access.expiresAt)}`}
                    {!access.expiresAt && " • Бессрочно"}
                  </span>
                </div>
                <Button
                  variant="text"
                  color="error"
                  onClick={() => handleRevokeCourseAccess(access.courseId)}
                >
                  Отозвать
                </Button>
              </div>
            ))}
          </div>
        ) : (
          <p className={s.empty__text}>Индивидуальные доступы к курсам отсутствуют</p>
        )}
      </Paper>

      {/* Lesson Access Section */}
      <Paper className={s.section}>
        <div className={s.section__header}>
          <h2 className={s.section__title}>Доступ к урокам</h2>
          <Button variant="text" onClick={() => setLessonDialogOpen(true)}>
            Добавить доступ
          </Button>
        </div>

        {/* Individual lesson access */}
        {lessonAccess.length > 0 && (
          <div className={s.access__subsection}>
            <h3 className={s.access__subsection__title}>Индивидуальный доступ</h3>
            <div className={s.access__list}>
              {lessonAccess.map((access) => (
                <div key={access.lessonId} className={s.access__item}>
                  <div className={s.access__info}>
                    <span className={s.access__name}>{access.lessonName}</span>
                    <span className={s.access__date}>
                      Выдан: {formatDate(access.grantedAt)}
                      {access.expiresAt && ` • До: ${formatDate(access.expiresAt)}`}
                      {!access.expiresAt && " • Бессрочно"}
                    </span>
                  </div>
                  <Button
                    variant="text"
                    color="error"
                    onClick={() => handleRevokeLessonAccess(access.lessonId)}
                  >
                    Отозвать
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}
        
        {/* Lessons from courses */}
        {lessonsFromCourses.filter(({ lessons }) => lessons.length > 0).map(({ lessons, courseId }) => {
          const course = allCourses.find(c => c.id === courseId);
          return (
            <div key={courseId} className={s.access__subsection}>
              <h3 className={s.access__subsection__title}>
                {course?.name || `Курс ${courseId}`}
              </h3>
              <div className={s.access__list}>
                {lessons.map((lesson) => (
                  <div key={lesson.id} className={s.access__item}>
                    <div className={s.access__info}>
                      <span className={s.access__name}>{lesson.name}</span>
                      <span className={s.access__date}>Доступ из курса</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}

        {lessonsFromCourses.every(({ lessons }) => lessons.length === 0) && lessonAccess.length === 0 && (
          <p className={s.empty__text}>Доступы к урокам отсутствуют</p>
        )}
      </Paper>

      {/* Subscription Dialog */}
      <Dialog open={subscriptionDialogOpen} onClose={() => setSubscriptionDialogOpen(false)}>
        <div className={s.dialog__content}>
          <h3 className={s.dialog__title}>Управление подпиской</h3>
          <div className={s.form__group}>
            <label className={s.form__label}>Тип подписки</label>
            <select
              className={s.form__select}
              value={subscriptionType || 'Не указано'}
              onChange={(e) => setSubscriptionType(e.target.value as Subscription['type'])}
            >
              <option value="Ознакомительная">Ознакомительная</option>
              <option value="Все включено">Все включено</option>
            </select>
          </div>
          <div className={s.form__group}>
            <label className={s.form__label}>Дата окончания</label>
            <input
              type="date"
              className={s.form__input}
              value={subscriptionEndDate}
              onChange={(e) => setSubscriptionEndDate(e.target.value)}
            />
          </div>
          <div className={s.dialog__actions}>
            <Button variant="text" onClick={() => setSubscriptionDialogOpen(false)}>
              Отмена
            </Button>
            <Button onClick={handleSubscriptionSubmit}>Сохранить</Button>
          </div>
        </div>
      </Dialog>

      {/* Course Access Dialog */}
      <AccessDialog
        open={courseDialogOpen}
        onClose={() => setCourseDialogOpen(false)}
        title="Добавить доступ к курсам"
        itemsLabel="Курсы"
        emptyText="Нет доступных курсов"
        items={availableCourses}
        selectedItems={selectedCourses}
        onItemChange={handleCourseCheckboxChange}
        expiresAt={courseExpiresAt}
        onExpiresAtChange={setCourseExpiresAt}
        onSubmit={handleGrantCourseAccess}
      />

      {/* Lesson Access Dialog */}
      <AccessDialog
        open={lessonDialogOpen}
        onClose={() => setLessonDialogOpen(false)}
        title="Добавить доступ к урокам"
        itemsLabel="Уроки"
        emptyText="Нет доступных уроков"
        items={availableLessons}
        selectedItems={selectedLessons}
        onItemChange={handleLessonCheckboxChange}
        expiresAt={lessonExpiresAt}
        onExpiresAtChange={setLessonExpiresAt}
        onSubmit={handleGrantLessonAccess}
      />

      {/* Role Dialog */}
      <Dialog open={roleDialogOpen} onClose={() => setRoleDialogOpen(false)}>
        <div className={s.dialog__content}>
          <h3 className={s.dialog__title}>Изменить роль</h3>
          <div className={s.form__group}>
            <label className={s.form__label}>Роль</label>
            <select
              className={s.form__select}
              value={selectedRole}
              onChange={(e) => setSelectedRole(e.target.value)}
            >
              <option value="user">Пользователь</option>
              <option value="admin">Администратор</option>
            </select>
          </div>
          <div className={s.dialog__actions}>
            <Button variant="text" onClick={() => setRoleDialogOpen(false)}>
              Отмена
            </Button>
            <Button onClick={handleRoleChange}>Сохранить</Button>
          </div>
        </div>
      </Dialog>
    </div>
  );
};

export default UserManagementClient;
