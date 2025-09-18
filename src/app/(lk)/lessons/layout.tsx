import Header from "@/app/components/header/Header";
import { MoveLeft } from "lucide-react";
import Link from "next/link";
import { FC } from "react";

const LessonLayout: FC<
  Readonly<{
    children: React.ReactNode;
  }>
> = ({ children }) => {
  return (
    <>
      <Header />
      <nav style={{ maxWidth: "1200px", margin: "auto" }}>
        <Link
          href="/dashboard"
          className="link"
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            padding: "8px",
          }}
        >
          <MoveLeft />
          Вернуться на главную
        </Link>
      </nav>
      {children}
    </>
  );
};

export default LessonLayout;
