import { Navbar } from "education-portal";

export const Student = () => (
  <Navbar user={{ id: "u-1", email: "anna.kuznetsova@mail.ru", role: "user" } as any} />
);

export const Manager = () => (
  <Navbar user={{ id: "u-2", email: "manager@edu.ru", role: "manager" } as any} />
);

export const Admin = () => (
  <Navbar user={{ id: "u-3", email: "admin@edu.ru", role: "admin" } as any} />
);

export const Guest = () => <Navbar />;
