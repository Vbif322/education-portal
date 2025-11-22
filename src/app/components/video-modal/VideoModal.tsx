"use client";

import { useRef, useState } from "react";
import { PlayIcon, X } from "lucide-react";
import Dialog from "../../ui/Dialog/Dialog";
import s from "./style.module.css";

interface VideoModalProps {
  videoSrc: string;
  buttonText?: string;
  buttonClassName?: string;
}

export default function VideoModal({
  videoSrc,
  buttonText = "Узнать больше",
  buttonClassName = "",
}: VideoModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false)

  const videoRef = useRef<HTMLVideoElement>(null)

  const handleOpen = () => {
    setIsOpen(true);
  };

  const handleClose = () => {
    if (videoRef.current) {
    videoRef.current.pause();
  }
    setIsOpen(false);
  };

  const onPlayClick = () => {
    if (!videoRef.current) {
      return
    }
    videoRef.current.play()
  }

  return (
    <>
      <button className={buttonClassName} onClick={handleOpen}>
        <PlayIcon size={20} />
        {buttonText}
      </button>

      <Dialog open={isOpen} onClose={handleClose}>
        <div className={s.modalContent}>
          {!isPlaying && <button className={s.playBtn} onClick={onPlayClick}><PlayIcon color="#FFF" size={60}/></button>}
          <button className={s.closeButton} onClick={handleClose}>
            <X size={24} color="#0F0F0F"/>
          </button>
          <div className={s.videoContainer}>
            <video
              ref={videoRef}
              controls
              className={s.video}
              preload="metadata"
              src={videoSrc}
              onPlay={()=>setIsPlaying(true)}
              onPause={()=>setIsPlaying(false)}
            >
              Ваш браузер не поддерживает воспроизведение видео.
            </video>
          </div>
        </div>
      </Dialog>
    </>
  );
}
