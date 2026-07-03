import { DeleteDialog } from "education-portal";

const noop = () => {};

export const Open = () => (
  <DeleteDialog open={true} onDelete={noop} onBack={noop} />
);
