import { Check } from "lucide-react";

export const Skill = ({ description }: { description: string }) => {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: "8px",
        maxWidth: "300px",
      }}
    >
      <Check />
      <p>{description}</p>
    </div>
  );
};
