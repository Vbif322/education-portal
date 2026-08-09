import Paper from "@/app/ui/Paper/Paper";
import { FC, ReactNode } from "react";
import s from "./style.module.css";
import Link from "next/link";
import { ChevronRight } from "lucide-react";

type Props = {
  title: string;
  rows: { navigate?: string; text1: string; text2: ReactNode }[];
  /** Действие в шапке блока — например «Продлить». */
  action?: ReactNode;
};

const SettingBlock: FC<Props> = ({ title, rows, action }) => {
  return (
    <section className={s.container}>
      <div className={s.header}>
        <h2 className={s.title}>{title}</h2>
        {action}
      </div>
      <Paper className={s.paper}>
        {rows.map((row, i) =>
          row.navigate ? (
            <Link key={i} href={row.navigate} className={s.link}>
              <p className={s.text1}>{row.text1}</p>
              <div className={s.text2}>{row.text2}</div>
              <ChevronRight className={s.icon} size={18} />
            </Link>
          ) : (
            <div key={i} className={s.link}>
              <p className={s.text1}>{row.text1}</p>
              <div className={s.text2}>{row.text2}</div>
            </div>
          )
        )}
      </Paper>
    </section>
  );
};

export default SettingBlock;
