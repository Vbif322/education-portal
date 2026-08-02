"use client";

import { useRef, useState } from "react";
import { PlayIcon } from "lucide-react";
import s from "./style.module.css";

interface InlineVideoPlayerProps {
  videoSrc: string;
  /** Подпись поверх стоп-кадра; скрывается на время воспроизведения. */
  badge?: string;
}

export default function InlineVideoPlayer({
  videoSrc,
  badge,
}: InlineVideoPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  // Бейдж — подпись именно к стоп-кадру, поэтому гасится навсегда после первого
  // запуска: по !isPlaying он возвращался бы на паузе поверх произвольного кадра.
  const [hasStarted, setHasStarted] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  const handlePlayClick = () => {
    // play() возвращает промис, который отклоняется с AbortError, если загрузку
    // ресурса прервали (пауза/смена src/размонтирование). Глотаем, чтобы не было
    // "Uncaught (in promise) DOMException" (в частности в Firefox).
    videoRef.current?.play().catch(() => {});
  };

  return (
    <div className={s.videoContainer}>
      {!hasStarted && badge && <span className={s.badge}>{badge}</span>}
      {!isPlaying && (
        <button
          className={s.playBtn}
          onClick={handlePlayClick}
          aria-label={badge ? `Смотреть: ${badge}` : "Смотреть видео"}
        >
          <PlayIcon color="#FFF" fill="#FFF" size={40} />
        </button>
      )}
      <video
        ref={videoRef}
        className={s.video}
        controls
        preload="metadata"
        src={videoSrc}
        onPlay={() => {
          setIsPlaying(true);
          setHasStarted(true);
        }}
        onPause={() => setIsPlaying(false)}
      >
        Ваш браузер не поддерживает воспроизведение видео.
      </video>
    </div>
  );
}
