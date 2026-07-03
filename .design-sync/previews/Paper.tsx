import { Paper } from "education-portal";

export const Default = () => (
  <div style={{ maxWidth: 420 }}>
    <Paper>
      <h3 style={{ margin: "0 0 8px", fontSize: 18, fontWeight: 600 }}>
        Frontend-разработчик с нуля
      </h3>
      <p style={{ margin: 0, color: "#6b7280", lineHeight: 1.5 }}>
        Полный курс по вёрстке и JavaScript: от первого тега до собственного
        приложения на React.
      </p>
    </Paper>
  </div>
);

export const StatCard = () => (
  <div style={{ maxWidth: 260 }}>
    <Paper>
      <div style={{ fontSize: 32, fontWeight: 700, color: "#2196F3" }}>1 248</div>
      <div style={{ color: "#6b7280", marginTop: 4 }}>активных студентов</div>
    </Paper>
  </div>
);

export const LessonInfo = () => (
  <div style={{ maxWidth: 420 }}>
    <Paper>
      <div style={{ fontSize: 13, color: "#6b7280", marginBottom: 6 }}>
        Модуль 3 · Урок 5
      </div>
      <h3 style={{ margin: "0 0 8px", fontSize: 18, fontWeight: 600 }}>
        Flexbox: выравнивание элементов
      </h3>
      <div style={{ display: "flex", gap: 16, color: "#6b7280", fontSize: 14 }}>
        <span>⏱ 14 мин</span>
        <span>Опубликован</span>
      </div>
    </Paper>
  </div>
);
