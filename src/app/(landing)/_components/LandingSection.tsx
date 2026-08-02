import s from "../landing.module.css";

type Props = {
  id?: string;
  title: string;
  children: React.ReactNode;
};

export default function LandingSection({ id, title, children }: Props) {
  return (
    <section className={s.section} id={id}>
      <h2 className={s.sectionTitle}>{title}</h2>
      {children}
    </section>
  );
}
