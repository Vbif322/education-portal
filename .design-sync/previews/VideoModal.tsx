import { VideoModal } from "education-portal";

// VideoModal styles its trigger button ONLY through the consumer-supplied
// `buttonClassName`; with none it renders as a browser-default button. Supply a
// DS-token-styled CTA class so the preview shows the intended appearance.
const triggerStyles = `
  .vm-cta {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    padding: 10px 20px;
    border: none;
    border-radius: 8px;
    background: var(--link-color, #2563eb);
    color: #fff;
    font-size: 15px;
    font-weight: 500;
    line-height: 1;
    cursor: pointer;
  }
  .vm-cta:hover { background: var(--link-color-hover, #1d4ed8); }
`;

export const Trigger = () => (
  <div style={{ maxWidth: 360 }}>
    <style>{triggerStyles}</style>
    <VideoModal videoSrc="/promo.mp4" buttonText="Смотреть демоурок" buttonClassName="vm-cta" />
  </div>
);

export const DefaultLabel = () => (
  <div style={{ maxWidth: 360 }}>
    <style>{triggerStyles}</style>
    <VideoModal videoSrc="/promo.mp4" buttonClassName="vm-cta" />
  </div>
);
