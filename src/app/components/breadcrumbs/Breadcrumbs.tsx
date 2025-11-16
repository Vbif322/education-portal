import { FC } from "react";
import Link from "next/link";
import { ChevronRight, Home } from "lucide-react";
import s from "./Breadcrumbs.module.css";

export interface BreadcrumbItem {
  label: string;
  href: string;
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[];
}

const Breadcrumbs: FC<BreadcrumbsProps> = ({ items }) => {
  return (
    <nav aria-label="Breadcrumb" className={s.nav}>
      <ol className={s.list}>
        <li className={s.item}>
          <Link href="/dashboard" className={s.link}>
            <Home size={16} />
          </Link>
        </li>
        {items.map((item, index) => (
          <li key={index} className={s.item}>
            <ChevronRight size={16} className={s.separator} />
            {index === items.length - 1 ? (
              <span className={s.current}>{item.label}</span>
            ) : (
              <Link href={item.href} className={s.link}>
                {item.label}
              </Link>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
};

export default Breadcrumbs;
