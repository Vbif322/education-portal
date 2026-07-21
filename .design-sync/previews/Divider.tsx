import { Divider } from "education-portal";

export const Default = () => (
  <div style={{ maxWidth: 420 }}>
    <Divider />
  </div>
);

export const BetweenSections = () => (
  <div style={{ maxWidth: 420 }}>
    <div style={{ fontWeight: 600, marginBottom: 8 }}>Модуль 1. Основы HTML</div>
    <div style={{ color: "#6b7280", marginBottom: 12 }}>
      Знакомство со структурой документа, семантическими тегами и формами.
    </div>
    <Divider />
    <div style={{ fontWeight: 600, margin: "12px 0 8px" }}>Модуль 2. Основы CSS</div>
    <div style={{ color: "#6b7280" }}>
      Селекторы, каскад, флексбокс и адаптивная вёрстка.
    </div>
  </div>
);

export const InCard = () => (
  <div
    style={{
      maxWidth: 420,
      border: "1px solid #e5e7eb",
      borderRadius: 8,
      padding: 16,
    }}
  >
    <div style={{ fontWeight: 600 }}>Frontend-разработчик с нуля</div>
    <div style={{ color: "#6b7280", fontSize: 14, margin: "4px 0 12px" }}>
      6 модулей · 48 уроков
    </div>
    <Divider />
    <div style={{ display: "flex", justifyContent: "space-between", marginTop: 12 }}>
      <span style={{ color: "#6b7280" }}>Прогресс</span>
      <span style={{ fontWeight: 600 }}>72%</span>
    </div>
  </div>
);
