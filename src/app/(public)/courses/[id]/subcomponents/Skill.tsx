import { Check } from "lucide-react";

export const Skill = ({ description }: { description: string }) => {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: "16px",
      }}
    >
      <Check style={{ flexShrink: 0 }} />
      <p>{description}</p>
    </div>
  );
};
