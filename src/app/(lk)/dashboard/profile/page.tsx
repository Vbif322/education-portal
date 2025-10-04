import SettingBlock from "@/app/components/setting-block/setting-block";
import { getUser, getUserSubscription } from "@/app/lib/dal";
import React from "react";

export default async function ProfilePage() {
  const user = await getUser();
  const userSub = await getUserSubscription();
  console.log(userSub);

  if (user === null || userSub === null) {
    return;
  }

  const main = [
    {
      text1: "Логин",
      text2: user.email,
    },
    // {
    //   text1: "Пароль",
    //   text2: "Изменить пароль",
    //   navigate: "password",
    // },
  ];

  const subscription = [
    {
      text1: "Тариф",
      text2: userSub.type || "",
    },
    {
      text1: "Дата окончания",
      text2: userSub.endedAt.toLocaleDateString("ru-RU"),
    },
  ];

  return (
    <div
      style={{
        display: "grid",
        width: "100%",
        justifyItems: "center",
        gap: "32px",
      }}
    >
      <SettingBlock title="Основные" rows={main} />
      <SettingBlock title="Подписка" rows={subscription} />
    </div>
  );
}
