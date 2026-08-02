import { Clock, ListChecks, MonitorPlay } from "lucide-react";
import s from "../landing.module.css";

/**
 * Три факта об устройстве одного урока — подпись к нарезке в блоке «Как
 * выглядят уроки». Намеренно не про выгоды (это секция «Что вы получаете»
 * выше), а про то, что зритель видит в ролике и получит в личном кабинете.
 */
const ITEMS = [
  {
    icon: <MonitorPlay />,
    title: "Видеоурок на одну тему",
    text: "Каждый урок — законченный сюжет: теория, схема на слайде и пример из практики.",
  },
  {
    icon: <Clock />,
    title: "Смотрите частями",
    text: "Плеер запоминает, где вы остановились, — урок можно поставить на паузу и вернуться позже.",
  },
  {
    icon: <ListChecks />,
    title: "Уроки собраны в модули",
    text: "В личном кабинете видно оглавление курса и какие темы уже пройдены.",
  },
];

export default function LessonFormat() {
  return (
    <ul className={s.lessonFormat}>
      {ITEMS.map((item) => (
        <li key={item.title}>
          <div className={s.lessonFormatIcon}>{item.icon}</div>
          <h3 className={s.lessonFormatTitle}>{item.title}</h3>
          <p className={s.lessonFormatText}>{item.text}</p>
        </li>
      ))}
    </ul>
  );
}
