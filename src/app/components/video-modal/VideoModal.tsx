"use client";

import { useState } from "react";
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

  const handleOpen = () => {
    setIsOpen(true);
  };

  const handleClose = () => {
    setIsOpen(false);
  };

  return (
    <>
      <button className={buttonClassName} onClick={handleOpen}>
        <PlayIcon size={20} />
        {buttonText}
      </button>

      <Dialog open={isOpen} onClose={handleClose}>
        <div className={s.modalContent}>
          <button className={s.closeButton} onClick={handleClose}>
            <X size={24} color="#0F0F0F"/>
          </button>
          <div className={s.videoContainer}>
            <video
              controls
              className={s.video}
              src={videoSrc}
            >
              Ваш браузер не поддерживает воспроизведение видео.
            </video>
          </div>
        </div>
      </Dialog>
    </>
  );
}
