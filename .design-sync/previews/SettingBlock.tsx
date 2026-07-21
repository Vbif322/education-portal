import { SettingBlock } from "education-portal";

export const Account = () => (
  <div style={{ maxWidth: 480 }}>
    <SettingBlock
      title="Аккаунт"
      rows={[
        { navigate: "/settings/email", text1: "Электронная почта", text2: "anna.kuznetsova@mail.ru" },
        { navigate: "/settings/password", text1: "Пароль", text2: "Изменить пароль" },
        { navigate: "/settings/notifications", text1: "Уведомления", text2: "Включены" },
      ]}
    />
  </div>
);

export const ReadOnlyInfo = () => (
  <div style={{ maxWidth: 480 }}>
    <SettingBlock
      title="Подписка"
      rows={[
        { text1: "Тарифный план", text2: "Все включено" },
        { text1: "Действует до", text2: "31 декабря 2026" },
        { text1: "Статус", text2: "Активна" },
      ]}
    />
  </div>
);

export const Mixed = () => (
  <div style={{ maxWidth: 480 }}>
    <SettingBlock
      title="Профиль"
      rows={[
        { text1: "Имя", text2: "Дмитрий Соколов" },
        { navigate: "/settings/avatar", text1: "Фотография", text2: "Загрузить новую" },
        { navigate: "/settings/delete", text1: "Удаление аккаунта", text2: "Безвозвратно" },
      ]}
    />
  </div>
);
