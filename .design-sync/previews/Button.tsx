import { Button } from "education-portal";

export const Filled = () => <Button>Записаться на курс</Button>;

export const Text = () => <Button variant="text">Подробнее</Button>;

export const Error = () => <Button color="error">Удалить урок</Button>;

export const Disabled = () => <Button disabled>Сохранение…</Button>;

export const AllVariants = () => (
  <div style={{ display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap" }}>
    <Button>Filled</Button>
    <Button variant="text">Text</Button>
    <Button color="error">Error</Button>
    <Button disabled>Disabled</Button>
  </div>
);
