import s from "../landing.module.css";

const STEPS = [
  {
    title: "Заявка",
    text: "Оставляете заявку с составом команды и задачами. Отвечаем в течение рабочего дня.",
  },
  {
    title: "Разбор задач",
    text: "Созваниваемся, уточняем роли сотрудников и подбираем набор курсов под них.",
  },
  {
    title: "Доступ сотрудникам",
    text: "Открываем доступ к выбранным курсам — каждому сотруднику в его личном кабинете.",
  },
  {
    title: "Обучение",
    text: "Сотрудники проходят уроки в удобное время: без командировок и остановки работы.",
  },
];

export default function HowItWorks() {
  return (
    <ol className={s.steps}>
      {STEPS.map((step, index) => (
        <li key={step.title} className={s.step}>
          <div className={s.stepNumber}>{index + 1}</div>
          <h3 className={s.stepTitle}>{step.title}</h3>
          <p className={s.stepText}>{step.text}</p>
        </li>
      ))}
    </ol>
  );
}
