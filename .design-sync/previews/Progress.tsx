import { Progress } from "education-portal";

export const Default = () => (
  <div style={{ maxWidth: 420 }}>
    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
      <span style={{ color: "#6b7280", fontSize: 14 }}>Прохождение курса</span>
      <span style={{ fontWeight: 600, fontSize: 14 }}>72%</span>
    </div>
    <Progress value={72} />
  </div>
);

export const Steps = () => (
  <div style={{ maxWidth: 420, display: "flex", flexDirection: "column", gap: 16 }}>
    <div>
      <div style={{ marginBottom: 6, fontSize: 14 }}>Модуль 1. Основы HTML</div>
      <Progress value={100} color="#2e7d32" />
    </div>
    <div>
      <div style={{ marginBottom: 6, fontSize: 14 }}>Модуль 2. Основы CSS</div>
      <Progress value={45} />
    </div>
    <div>
      <div style={{ marginBottom: 6, fontSize: 14 }}>Модуль 3. JavaScript</div>
      <Progress value={8} />
    </div>
  </div>
);

export const Empty = () => (
  <div style={{ maxWidth: 420 }}>
    <div style={{ marginBottom: 6, fontSize: 14, color: "#6b7280" }}>
      Курс ещё не начат
    </div>
    <Progress value={0} />
  </div>
);

export const Complete = () => (
  <div style={{ maxWidth: 420 }}>
    <div style={{ marginBottom: 6, fontSize: 14, color: "#2e7d32" }}>
      Курс пройден
    </div>
    <Progress value={100} color="#2e7d32" />
  </div>
);
