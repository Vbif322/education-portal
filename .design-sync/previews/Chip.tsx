import { Chip } from "education-portal";

export const Default = () => <Chip text="HTML и CSS" />;

export const SkillTags = () => (
  <div style={{ display: "flex", gap: 8, flexWrap: "wrap", maxWidth: 420 }}>
    <Chip text="JavaScript" />
    <Chip text="React" />
    <Chip text="TypeScript" />
    <Chip text="Адаптивная вёрстка" />
    <Chip text="Git" />
  </div>
);

export const StatusColors = () => (
  <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
    <Chip text="Опубликован" backgroundColor="#d7f5e3" />
    <Chip text="Черновик" backgroundColor="#f3f4f6" />
    <Chip text="На проверке" backgroundColor="#fff2cc" />
    <Chip text="Архив" backgroundColor="#fde2e1" />
  </div>
);

export const LevelBadges = () => (
  <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
    <Chip text="Начальный" backgroundColor="#e8eef7" />
    <Chip text="Средний" backgroundColor="#dbe7ff" />
    <Chip text="Продвинутый" backgroundColor="#c7d6f0" />
  </div>
);
