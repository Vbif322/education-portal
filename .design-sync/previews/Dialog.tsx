import { Dialog, Button } from "education-portal";

export const Default = () => (
  <Dialog open={true} onClose={() => {}}>
    <div style={{ maxWidth: 360 }}>
      <h2 style={{ margin: "0 0 8px", fontSize: 20, fontWeight: 600 }}>
        Завершить урок?
      </h2>
      <p style={{ margin: "0 0 20px", color: "#6b7280", lineHeight: 1.5 }}>
        Прогресс по уроку «Flexbox: выравнивание элементов» будет сохранён, и вы
        перейдёте к следующему уроку модуля.
      </p>
      <div style={{ display: "flex", gap: 12, justifyContent: "flex-end" }}>
        <Button variant="text">Отмена</Button>
        <Button>Завершить</Button>
      </div>
    </div>
  </Dialog>
);

export const FormDialog = () => (
  <Dialog open={true} onClose={() => {}}>
    <div style={{ maxWidth: 380 }}>
      <h2 style={{ margin: "0 0 16px", fontSize: 20, fontWeight: 600 }}>
        Новый модуль
      </h2>
      <label style={{ display: "block", fontSize: 14, marginBottom: 6 }}>
        Название модуля
      </label>
      <input
        defaultValue="Основы TypeScript"
        style={{
          width: "100%",
          padding: "8px 12px",
          border: "1px solid #d1d5db",
          borderRadius: 6,
          marginBottom: 20,
          boxSizing: "border-box",
        }}
      />
      <div style={{ display: "flex", gap: 12, justifyContent: "flex-end" }}>
        <Button variant="text">Отмена</Button>
        <Button>Создать</Button>
      </div>
    </div>
  </Dialog>
);
