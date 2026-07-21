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
    videoRef.current?.play();
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
