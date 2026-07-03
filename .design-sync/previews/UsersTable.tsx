import { UsersTable } from "education-portal";

const users = [
  {
    id: "a1b2c3d4-0001",
    email: "anna@mail.ru",
    role: "user",
    subscription: {
      id: 1,
      type: "Все включено",
      endedAt: new Date("2099-01-15"),
      userId: "a1b2c3d4-0001",
    },
  },
  {
    id: "a1b2c3d4-0002",
    email: "ivan@mail.ru",
    role: "manager",
    subscription: {
      id: 2,
      type: "Ознакомительная",
      endedAt: new Date("2019-12-01"),
      userId: "a1b2c3d4-0002",
    },
  },
  {
    id: "a1b2c3d4-0003",
    email: "maria@mail.ru",
    role: "user",
    subscription: {
      id: 3,
      type: "Все включено",
      endedAt: new Date("2099-06-20"),
      userId: "a1b2c3d4-0003",
    },
  },
  {
    id: "a1b2c3d4-0004",
    email: "admin@portal.ru",
    role: "admin",
    subscription: {
      id: 4,
      type: "Все включено",
      endedAt: new Date("2099-03-10"),
      userId: "a1b2c3d4-0004",
    },
  },
  {
    id: "a1b2c3d4-0005",
    email: "dmitry@mail.ru",
    role: "user",
    subscription: {
      id: 5,
      type: "Ознакомительная",
      endedAt: new Date("2018-08-30"),
      userId: "a1b2c3d4-0005",
    },
  },
] as any;

export const Default = () => (
  <div style={{ maxWidth: 820 }}>
    <UsersTable data={users} />
  </div>
);

export const SingleActive = () => (
  <div style={{ maxWidth: 820 }}>
    <UsersTable data={[users[0]]} />
  </div>
);
