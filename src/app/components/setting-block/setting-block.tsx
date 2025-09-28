import Paper from "@/app/ui/Paper/Paper";
import { FC } from "react";
import s from "./style.module.css";
import Link from "next/link";
import { ChevronRight } from "lucide-react";

type Props = {
  title: string;
  rows: any[];
};

const SettingBlock: FC<Props> = ({ title, rows }) => {
  return (
    <div className={s.container}>
      <Paper className={s.paper}>
        <p className={s.title}>{title}</p>
        {rows.map((row, i) => {
          return (
            <div key={i}>
              {row.navigate ? (
                <Link href={"#"} className={s.link}>
                  <p className={s.text1}>{row.text1}</p>
                  <p>{row.text2}</p>
                  <ChevronRight className={s.icon} />
                </Link>
              ) : (
                <div className={s.link}>
                  <p className={s.text1}>{row.text1}</p>
                  <p>{row.text2}</p>
                </div>
              )}
            </div>
          );
        })}
      </Paper>
    </div>
  );
};

export default SettingBlock;
