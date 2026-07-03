import { Breadcrumbs } from "education-portal";

export const CourseLesson = () => (
  <Breadcrumbs
    items={[
      { label: "Курсы", href: "/courses" },
      { label: "Веб-разработка с нуля", href: "/courses/12" },
      { label: "Урок 3. Флексбоксы", href: "/courses/12/lessons/45" },
    ]}
  />
);

export const SingleLevel = () => (
  <Breadcrumbs items={[{ label: "Все курсы", href: "/courses" }]} />
);

export const AdminSection = () => (
  <Breadcrumbs
    items={[
      { label: "Панель управления", href: "/admin" },
      { label: "Пользователи", href: "/admin/users" },
      { label: "Мария Соколова", href: "/admin/users/8" },
    ]}
  />
);
