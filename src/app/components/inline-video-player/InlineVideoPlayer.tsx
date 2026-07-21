"use client";

import { useRef, useState } from "react";
import { PlayIcon } from "lucide-react";
import s from "./style.module.css";

interface InlineVideoPlayerProps {
  videoSrc: string;
}

export default function InlineVideoPlayer({ videoSrc }: InlineVideoPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  const handlePlayClick = () => {
    // play() возвращает промис, который отклоняется с AbortError, если загрузку
    // ресурса прервали (пауза/смена src/размонтирование). Глотаем, чтобы не было
    // "Uncaught (in promise) DOMException" (в частности в Firefox).
    videoRef.current?.play().catch(() => {});
  };

  return (
    <div className={s.videoContainer}>
      {!isPlaying && (
        <button
          className={s.playBtn}
          onClick={handlePlayClick}
          aria-label="Смотреть видео"
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
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
      >
        Ваш браузер не поддерживает воспроизведение видео.
      </video>
    </div>
  );
}
