import { FeatureCard } from "education-portal";
import { GraduationCap, Video, Award } from "lucide-react";

export const Learning = () => (
  <div style={{ maxWidth: 320 }}>
    <FeatureCard
      icon={<GraduationCap size={32} />}
      title="Экспертные курсы"
      description="Программы, составленные практикующими преподавателями ведущих вузов и компаний."
      color="#2563eb"
    />
  </div>
);

export const VideoLessons = () => (
  <div style={{ maxWidth: 320 }}>
    <FeatureCard
      icon={<Video size={32} />}
      title="Видеоуроки"
      description="Более 500 видеоуроков с пожизненным доступом и возможностью учиться в своём темпе."
      color="#16a34a"
    />
  </div>
);

export const Certificate = () => (
  <div style={{ maxWidth: 320 }}>
    <FeatureCard
      icon={<Award size={32} />}
      title="Сертификаты"
      description="Получайте официальный сертификат после успешного завершения каждого курса."
      color="#f59e0b"
    />
  </div>
);
