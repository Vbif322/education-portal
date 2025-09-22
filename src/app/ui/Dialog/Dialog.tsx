"use client";

import React, { FC, MouseEvent, ReactNode, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import s from "./style.module.css";

type Props = {
  open: boolean;
  onClose?: () => void;
  children?: ReactNode;
} & React.HTMLAttributes<HTMLDivElement>;

const Dialog: FC<Props> = ({ open, onClose, children, onClick, ...props }) => {
  const backdropClick = useRef<boolean>(null);

  useEffect(() => {
    if (open) {
      document.documentElement.style.overflow = "hidden";
    } 
    return () => {
      document.documentElement.style.overflow = "";
    };
  }, [open]);

  const handleMouseDown = (event: MouseEvent<HTMLDivElement>) => {
    backdropClick.current = event.target === event.currentTarget;
  };

  const handleBackdropClick = (event: MouseEvent<HTMLDivElement>) => {
    if (onClick) {
      onClick(event);
    }

    // Ignore the events not coming from the "backdrop".
    if (!backdropClick.current) {
      return;
    }

    backdropClick.current = null;

    if (onClose) {
      onClose();
    }
  };

  if (!open) {
    return null;
  }
  return createPortal(
    <div
      role="presentation"
      className={s.root}
      onClick={handleBackdropClick}
      {...props}
    >
      <div className={s["dialog-backdrop"]} aria-hidden="true"></div>
      <div
        className={s["dialog-container"]}
        role="presentation"
        tabIndex={-1}
        onMouseDown={handleMouseDown}
      >
        <div className={s["dialog-content"]} role="dialog" aria-modal="true">
          {children}
        </div>
      </div>
    </div>,
    document.body
  );
};

export default Dialog;
