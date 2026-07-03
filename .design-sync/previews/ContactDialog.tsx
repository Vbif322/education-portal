import { ContactDialog } from "education-portal";

const noop = () => {};

export const Open = () => <ContactDialog open={true} onClose={noop} />;
