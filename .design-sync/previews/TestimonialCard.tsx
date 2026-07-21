import { TestimonialCard } from "education-portal";

export const Default = () => (
  <div style={{ maxWidth: 420 }}>
    <TestimonialCard
      description="Курс помог мне с нуля разобраться в вёрстке и вёрстке адаптива. Материал подан структурно, а практические задания закрепляют каждую тему."
      name="Анна Кузнецова"
      appointment="Frontend-разработчик, Яндекс"
    />
  </div>
);

export const ShortQuote = () => (
  <div style={{ maxWidth: 420 }}>
    <TestimonialCard
      description="Лучший онлайн-курс, что я проходил. Рекомендую всем, кто хочет сменить профессию."
      name="Дмитрий Соколов"
      appointment="Студент"
    />
  </div>
);
