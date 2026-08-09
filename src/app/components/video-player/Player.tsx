"use client";

import {
  DetailedHTMLProps,
  FC,
  useCallback,
  useEffect,
  useRef,
  useState,
  VideoHTMLAttributes,
} from "react";
import { AlertTriangle } from "lucide-react";
import s from "./Player.module.css";

type Props = {
  lessonId: number;
} & DetailedHTMLProps<VideoHTMLAttributes<HTMLVideoElement>, HTMLVideoElement>;

const Player: FC<Props> = ({ lessonId, ...props }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [error, setError] = useState<string>("");
  const [savedProgress, setSavedProgress] = useState(0);
  const [hasAutoCompleted, setHasAutoCompleted] = useState(false);
  const lastSaveTime = useRef<number>(0);

  // Загрузка сохраненного прогресса при монтировании
  useEffect(() => {
    const fetchSavedProgress = async () => {
      try {
        const response = await fetch(`/api/lessons/${lessonId}/progress`);
        if (response.ok) {
          const data = await response.json();
          setSavedProgress(data.currentTime || 0);
          setHasAutoCompleted(data.completed || false);
        }
      } catch (err) {
        console.error("Error fetching progress:", err);
      }
    };

    fetchSavedProgress();
  }, [lessonId]);

  // Сохранение прогресса
  const saveProgress = useCallback(
    async (forceComplete = false) => {
      if (!videoRef.current) return;

      const currentTime = videoRef.current.currentTime;
      const duration = videoRef.current.duration;

      if (isNaN(duration) || duration === 0) return;

      const watchedPercentage = currentTime / duration;
      const completed = forceComplete || watchedPercentage >= 0.9;

      try {
        await fetch(`/api/lessons/${lessonId}/progress`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            currentTime: Math.floor(currentTime),
            duration: Math.floor(duration),
            completed: completed && !hasAutoCompleted,
          }),
        });

        // Отмечаем, что автозавершение произошло
        if (completed && !hasAutoCompleted) {
          setHasAutoCompleted(true);
        }
      } catch (err) {
        console.error("Error saving progress:", err);
      }
    },
    [lessonId, hasAutoCompleted]
  );

  // Восстановление прогресса при загрузке видео
  const handleLoadedMetadata = () => {
    if (videoRef.current && savedProgress > 0) {
      videoRef.current.currentTime = savedProgress;
    }
  };

  // Обновление прогресса
  const handleTimeUpdate = () => {
    if (!videoRef.current) return;

    const currentTime = videoRef.current.currentTime;
    const duration = videoRef.current.duration;

    if (!isNaN(duration) && duration > 0) {
      const watchedPercentage = currentTime / duration;

      // Сохраняем прогресс каждые 10 секунд
      if (Math.floor(currentTime) - lastSaveTime.current >= 10) {
        lastSaveTime.current = Math.floor(currentTime);
        saveProgress();
      }

      // Автоматическая отметка при достижении 90%
      if (watchedPercentage >= 0.9 && !hasAutoCompleted) {
        saveProgress(true);
      }
    }
  };

  // Сохранение прогресса при паузе или закрытии
  const handlePause = () => saveProgress();
  const handleEnded = () => saveProgress(true);

  useEffect(() => {
    const handleBeforeUnload = () => saveProgress();
    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
      saveProgress();
    };
  }, [saveProgress]);

  // Ошибка загрузки видео: раньше состояние не устанавливалось нигде,
  // а её разметка использовала несуществующие в проекте Tailwind-классы.
  const handleError = () => {
    const code = videoRef.current?.error?.code;
    setError(
      code === MediaError.MEDIA_ERR_NETWORK
        ? "Не удалось загрузить видео — проверьте соединение."
        : code === MediaError.MEDIA_ERR_DECODE ||
          code === MediaError.MEDIA_ERR_SRC_NOT_SUPPORTED
        ? "Формат видео не поддерживается этим браузером."
        : "Видео недоступно. Попробуйте обновить страницу."
    );
  };

  const retry = () => {
    setError("");
    videoRef.current?.load();
  };

  if (error) {
    return (
      <div className={s.container}>
        <div className={s.videoWrapper}>
          <div className={s.error} role="alert">
            <AlertTriangle size={28} aria-hidden="true" />
            <p className={s.errorText}>{error}</p>
            <button type="button" className={s.retry} onClick={retry}>
              Повторить
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={s.container}>
      <div className={s.videoWrapper}>
        <video
          className={s.video}
          ref={videoRef}
          controls
          controlsList="nodownload"
          onTimeUpdate={handleTimeUpdate}
          onLoadedMetadata={handleLoadedMetadata}
          onPause={handlePause}
          onEnded={handleEnded}
          onError={handleError}
          preload="metadata"
          {...props}
        >
          <source src={`/api/videos?lessonId=${lessonId}`} type="video/mp4" />
          Ваш браузер не поддерживает видео
        </video>
      </div>
    </div>
  );
};

export default Player;
