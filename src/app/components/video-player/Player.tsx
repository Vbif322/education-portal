"use client";

import {
  DetailedHTMLProps,
  FC,
  // SourceHTMLAttributes,
  // useCallback,
  // useEffect,
  useRef,
  useState,
  VideoHTMLAttributes,
} from "react";

type Props = {
  // source: SourceHTMLAttributes<HTMLSourceElement>;
  videoId: string;
} & DetailedHTMLProps<VideoHTMLAttributes<HTMLVideoElement>, HTMLVideoElement>;

const Player: FC<Props> = ({
  // source,
  videoId,
  width = "1080",
  height = "720",
  ...props
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  // const [streamUrl, setStreamUrl] = useState<string>("");
  // const [loading, setLoading] = useState(true);
  const [error] = useState<string>("");
  // const [progress, setProgress] = useState(0);
  // const [buffering, setBuffering] = useState(false);
  // const [savedProgress, setSavedProgress] = useState(0);
  // const progressSaveInterval = useRef<NodeJS.Timeout>(null);

  // useEffect(() => {
  //   fetchStreamUrl();
  //   // fetchSavedProgress();

  //   return () => {
  //     if (progressSaveInterval.current) {
  //       clearInterval(progressSaveInterval.current);
  //     }
  //   };
  // }, [videoId]);

  // const fetchStreamUrl = async () => {
  //   try {
  //     setLoading(true);
  //     const response = await fetch("/api/videos/?name=" + videoId);
  //     if (!response.ok) {
  //       throw new Error("Не удалось загрузить видео");
  //     }
  //     const data = await response.json();
  //     console.log(data, "data");
  //     setStreamUrl(data.streamUrl);
  //   } catch (err: any) {
  //     console.log(err);
  //     setError(err.message);
  //   } finally {
  //     setLoading(false);
  //   }
  // };

  // const fetchSavedProgress = async () => {
  //   try {
  //     const response = await fetch(`/api/videos/${videoId}/progress`);
  //     if (response.ok) {
  //       const data = await response.json();
  //       setSavedProgress(data.currentTime || 0);
  //     }
  //   } catch (err) {
  //     console.error("Error fetching progress:", err);
  //   }
  // };

  // Сохранение прогресса
  // const saveProgress = useCallback(async () => {
  //   if (!videoRef.current) return;

  //   const currentTime = videoRef.current.currentTime;
  //   const duration = videoRef.current.duration;

  //   if (isNaN(duration) || duration === 0) return;

  //   const completed = currentTime / duration > 0.9;

  //   // try {
  //   //   await fetch(`/api/videos/${videoId}/progress`, {
  //   //     method: "POST",
  //   //     headers: { "Content-Type": "application/json" },
  //   //     body: JSON.stringify({
  //   //       currentTime,
  //   //       duration,
  //   //       completed,
  //   //     }),
  //   //   });
  //   // } catch (err) {
  //   //   console.error("Error saving progress:", err);
  //   // }
  //   console.log(
  //     {
  //       currentTime,
  //       duration,
  //       completed,
  //     },
  //     "save"
  //   );
  // }, [videoId]);

  // Восстановление прогресса при загрузке видео
  // const handleLoadedMetadata = () => {
  //   if (videoRef.current && savedProgress > 0) {
  //     videoRef.current.currentTime = savedProgress;
  //   }
  // };

  // Обновление прогресса
  // const handleTimeUpdate = () => {
  //   if (!videoRef.current) return;

  //   const currentTime = videoRef.current.currentTime;
  //   const duration = videoRef.current.duration;

  //   if (!isNaN(duration) && duration > 0) {
  //     setProgress((currentTime / duration) * 100);

  //     // Сохраняем прогресс каждые 10 секунд
  //     if (Math.floor(currentTime) % 10 === 0) {
  //       saveProgress();
  //     }
  //   }
  // };

  // Обработка буферизации
  // const handleWaiting = () => setBuffering(true);
  // const handlePlaying = () => setBuffering(false);
  // const handleCanPlay = () => setBuffering(false);

  // Сохранение прогресса при паузе или закрытии
  // const handlePause = () => saveProgress();

  // useEffect(() => {
  //   const handleBeforeUnload = () => saveProgress();
  //   window.addEventListener("beforeunload", handleBeforeUnload);

  //   return () => {
  //     window.removeEventListener("beforeunload", handleBeforeUnload);
  //     saveProgress();
  //   };
  // }, [saveProgress]);

  // if (loading) {
  //   return (
  //     <div className="relative aspect-video bg-gray-900 rounded-lg overflow-hidden">
  //       <div className="absolute inset-0 flex items-center justify-center">
  //         <div className="text-white">Загрузка видео...</div>
  //       </div>
  //     </div>
  //   );
  // }

  if (error) {
    return (
      <div className="relative aspect-video bg-gray-900 rounded-lg overflow-hidden">
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-red-400">Ошибка: {error}</div>
        </div>
      </div>
    );
  }

  return (
    <video
      width={width}
      height={height}
      ref={videoRef}
      controls
      controlsList="nodownload"
      // onTimeUpdate={handleTimeUpdate}
      // onLoadedMetadata={handleLoadedMetadata}
      // onPause={handlePause}
      // onEnded={saveProgress}
      // onWaiting={handleWaiting}
      // onPlaying={handlePlaying}
      // onCanPlay={handleCanPlay}
      preload="metadata"
      {...props}
    >
      {/* <source src="/videos/Управление задачами 12.mp4" type="video/mp4" /> */}
      <source src={`/api/videos?name=${videoId}`} type="video/mp4" />
      Ваш браузер не поддерживает видео
    </video>
  );
};

export default Player;
