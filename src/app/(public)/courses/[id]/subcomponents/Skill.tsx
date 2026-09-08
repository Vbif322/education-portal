import { Check } from "lucide-react";
import s from "../style.module.css";

/**
 * Приобретаемый навык как отмеченное умение.
 *
 * Формулировка «что вы сможете делать» работает на посадочной лучше, чем
 * россыпь чипов-ярлыков: список читается как обещание результата, а не как
 * набор тегов.
 */
export const Skill = ({ description }: { description: string }) => {
  return (
    <li className={s.skill}>
      <Check className={s.skill__icon} size={20} aria-hidden="true" />
      <span>{description}</span>
    </li>
  );
};
