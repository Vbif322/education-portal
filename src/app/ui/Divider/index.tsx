import { DetailedHTMLProps, FC, HTMLAttributes } from "react";

type Props = {} & DetailedHTMLProps<
  HTMLAttributes<HTMLHRElement>,
  HTMLHRElement
>;

const Divider: FC<Props> = (props) => {
  return <hr {...props} />;
};

export default Divider;
