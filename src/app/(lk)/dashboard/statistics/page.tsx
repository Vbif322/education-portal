import { FC } from "react";
import { BarChart3 } from "lucide-react";
import EmptyState from "@/app/ui/EmptyState/EmptyState";

export const metadata = { title: "Статистика" };

/**
 * Заглушка: маршрут пока не выведен в навигацию. Данные для наполнения уже
 * собираются — `analytics_user_visits` и `usersToLessons`.
 */
const StatisticsPage: FC = () => {
  return (
    <EmptyState
      tone="neutral"
      icon={<BarChart3 size={28} />}
      title="Статистика в разработке"
      description="Здесь появится динамика обучения: активность по дням, время в уроках и прогресс по курсам."
    />
  );
};

export default StatisticsPage;
