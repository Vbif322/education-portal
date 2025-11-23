"use client";

import { FC } from "react";
import { useRouter } from "next/navigation";
import s from "./style.module.css";
import Button from "@/app/ui/Button/Button";
import { UserWithSubscription } from "@/@types/user";

type Props = {
  data: UserWithSubscription[];
};

const UsersTable: FC<Props> = ({ data }) => {
  const router = useRouter();

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString("ru-RU", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  const isSubscriptionActive = (endDate: Date) => {
    return new Date(endDate).getTime() > new Date().getTime();
  };

  return (
    <div className={s.table__container}>
      <table className={s.table}>
        <thead>
          <tr>
            <th>Email</th>
            <th>Роль</th>
            <th>Тип подписки</th>
            <th>Окончание подписки</th>
            <th>Статус</th>
            <th style={{ textAlign: "center" }}>Управление</th>
          </tr>
        </thead>
        <tbody>
          {data.map((user) => {
            const hasActiveSubscription = user.subscription
              ? isSubscriptionActive(user.subscription.endedAt)
              : false;

            return (
              <tr key={user.id}>
                <td>{user.email}</td>
                <td>
                  {user.role === "admin"
                    ? "Администратор"
                    : user.role === "manager"
                    ? "Менеджер"
                    : "Пользователь"}
                </td>
                <td>{user.subscription?.type || ""}</td>
                <td>
                  {user.subscription
                    ? formatDate(user.subscription.endedAt)
                    : ""}
                </td>
                <td>
                  {user.subscription ? (
                    hasActiveSubscription ? (
                      <span style={{ color: "green" }}>Активна</span>
                    ) : (
                      <span style={{ color: "red" }}>Истекла</span>
                    )
                  ) : (
                    ""
                  )}
                </td>
                <td style={{ display: "flex", justifyContent: "center" }}>
                  <Button
                    variant="text"
                    onClick={() => router.push(`/dashboard/users/${user.id}`)}
                  >
                    Перейти
                  </Button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default UsersTable;
