"use client";

import {
  DetailedHTMLProps,
  FC,
  SourceHTMLAttributes,
  VideoHTMLAttributes,
} from "react";

type Props = {
  source: SourceHTMLAttributes<HTMLSourceElement>;
} & DetailedHTMLProps<VideoHTMLAttributes<HTMLVideoElement>, HTMLVideoElement>;

const Player: FC<Props> = ({
  source,
  width = "1080",
  height = "720",
  ...props
}) => {
  return (
    <video width={width} height={height} {...props}>
      <source {...source} />
      {/* <source src="/videos/Управление задачами 12.mp4" type="video/mp4" /> */}
      Ваш браузер не поддерживает видео
    </video>
  );
};

export default Player;
