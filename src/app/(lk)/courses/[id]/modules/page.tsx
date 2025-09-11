import { FC } from "react";

type Props = {};

const ThemePage: FC<Props> = (props) => {
  return (
    <div>
      <video width="320" height="240" controls preload="none">
        <source src="/videos/Как менялся пит-стоп.mp4" type="video/mp4" />
        Your browser does not support the video tag.
      </video>
    </div>
  );
};

export default ThemePage;
