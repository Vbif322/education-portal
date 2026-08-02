import s from "../landing.module.css";

type Props = {
  id?: string;
  title: string;
  /** Вводный абзац между заголовком и содержимым секции. */
  lead?: string;
  children: React.ReactNode;
};

export default function LandingSection({ id, title, lead, children }: Props) {
  return (
    <section className={s.section} id={id}>
      <h2 className={s.sectionTitle}>{title}</h2>
      {lead && <p className={s.sectionLead}>{lead}</p>}
      {children}
    </section>
  );
}
