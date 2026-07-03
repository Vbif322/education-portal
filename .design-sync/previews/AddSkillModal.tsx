import { AddSkillModal } from "education-portal";

const noop = () => {};
const onAdd = async () => ({ success: true });

export const Open = () => (
  <AddSkillModal isOpen={true} onClose={noop} onAdd={onAdd as any} />
);
