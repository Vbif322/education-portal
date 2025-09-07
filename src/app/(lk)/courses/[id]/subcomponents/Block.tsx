import { ReactNode } from "react";

export const Block = ({
  title,
  subtitle,
  lastElement,
}: {
  title: string | ReactNode;
  subtitle?: string | ReactNode;
  lastElement?: boolean;
}) => {
  return (
    <div
      style={{
        paddingInline: "48px",
        paddingBlock: "8px",
        borderRight: lastElement ? "none" : "2px solid #dee2e6",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
      }}
    >
      <div
        style={{ fontWeight: 600, fontSize: "1.25rem", marginBottom: "4px" }}
      >
        {title}
      </div>
      {subtitle && <div>{subtitle}</div>}
    </div>
  );
};
