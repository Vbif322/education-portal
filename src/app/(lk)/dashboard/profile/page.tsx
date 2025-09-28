import SettingBlock from "@/app/components/setting-block/setting-block";
import { getUser } from "@/app/lib/dal";
import React from "react";

export default async function ProfilePage() {
  const user = await getUser();

  if (user === null) {
    return;
  }

  const setting = [
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

  return (
    <div
      style={{
        display: "flex",
        width: "100%",
        justifyContent: "center",
      }}
    >
      <SettingBlock title="Настройки" rows={setting} />
    </div>
  );
}
