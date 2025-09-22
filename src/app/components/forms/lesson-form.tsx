import { FC, useActionState, useRef } from "react";
import s from "./style.module.css";
import { addLesson } from "@/app/actions/lesson";

type Props = {};

const LessonForm: FC<Props> = (props) => {
  const [state, formAction] = useActionState(addLesson, undefined);
  const formRef = useRef(null);

  // Сбрасываем форму после успешной отправки
  //   useEffect(() => {
  //     if (state.success) {
  //       formRef.current?.reset();
  //     }
  //   }, [state.success]);
  return (
    <div className="form-container">
      <h2>Добавить новый урок</h2>
      <form ref={formRef} action={formAction}>
        <div className="form-group">
          <label htmlFor="name">Название (обязательно)</label>
          <input type="text" id="name" name="name" required />
        </div>

        <div className="form-group">
          <label htmlFor="videoURL">URL видео (обязательно)</label>
          <input
            type="url"
            id="videoURL"
            name="videoURL"
            placeholder="https://example.com/video.mp4"
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="status">Статус (обязательно)</label>
          <select id="status" name="status" defaultValue="private" required>
            <option value="private">Приватное</option>
            <option value="public">Публичное</option>
            <option value="unlisted">По ссылке</option>
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="description">Описание (необязательно)</label>
          <textarea id="description" name="description" rows={4}></textarea>
        </div>

        {/* Отображение сообщений об успехе или ошибке */}
        {/* {state?.message && (
          <p className={`message ${state?.success ? "success" : "error"}`}>
            {state?.message}
          </p>
        )} */}

        <button type="submit"></button>
      </form>
    </div>
  );
};

export default LessonForm;
