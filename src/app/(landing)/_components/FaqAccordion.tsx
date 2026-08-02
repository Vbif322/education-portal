import { ChevronDown } from "lucide-react";
import s from "../landing.module.css";

export type FaqItem = {
  question: string;
  /** Простой текст: тот же ответ уходит в JSON-LD, разметка там недопустима. */
  answer: string;
};

type Props = {
  items: FaqItem[];
};

/** Разметка schema.org/FAQPage — строится из тех же данных, что и список,
 *  поэтому не может разойтись с тем, что видит пользователь.
 *
 *  Символ «меньше» подменяем его юникод-эскейпом: для JSON это тот же символ,
 *  но HTML-парсер закрывает script на первой последовательности "</script"
 *  даже внутри строкового литерала. Сейчас тексты — наши константы, однако
 *  если FAQ когда-нибудь начнут заполнять из БД, без этого получится XSS. */
function faqSchemaJson(items: FaqItem[]) {
  const schema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: { "@type": "Answer", text: item.answer },
    })),
  };

  return JSON.stringify(schema).replace(/</g, "\\u003c");
}

export default function FaqAccordion({ items }: Props) {
  return (
    <div className={s.faqList}>
      {items.map((item) => (
        <details key={item.question} className={s.faqItem}>
          <summary className={s.faqQuestion}>
            <span>{item.question}</span>
            <ChevronDown className={s.faqIcon} size={20} aria-hidden />
          </summary>
          <p className={s.faqAnswer}>{item.answer}</p>
        </details>
      ))}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: faqSchemaJson(items) }}
      />
    </div>
  );
}
