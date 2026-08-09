"use client";

import React, {
  FC,
  MouseEvent,
  ReactNode,
  useCallback,
  useEffect,
  useId,
  useRef,
} from "react";
import { createPortal } from "react-dom";
import s from "./style.module.css";

type Props = {
  open: boolean;
  onClose?: () => void;
  /** Доступное имя диалога. Рендерится визуально скрытым, если нет заголовка. */
  label?: string;
  children?: ReactNode;
} & React.HTMLAttributes<HTMLDivElement>;

const FOCUSABLE =
  'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])';

const Dialog: FC<Props> = ({
  open,
  onClose,
  label,
  children,
  onClick,
  ...props
}) => {
  const backdropClick = useRef<boolean>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const previouslyFocused = useRef<HTMLElement | null>(null);
  const wasOpen = useRef(false);
  const labelId = useId();

  // Триггер запоминается в рендере, а не в эффекте: `autoFocus` у полей внутри
  // диалога применяется в фазе коммита, то есть раньше любого эффекта, — к
  // моменту эффекта activeElement уже указывает внутрь диалога.
  if (open && !wasOpen.current && typeof document !== "undefined") {
    previouslyFocused.current = document.activeElement as HTMLElement | null;
  }
  wasOpen.current = open;

  useEffect(() => {
    if (!open) return;

    document.documentElement.style.overflow = "hidden";

    // Фокус внутрь диалога — только если его туда ещё не увёл autoFocus.
    const content = contentRef.current;
    if (content && !content.contains(document.activeElement)) {
      const first = content.querySelector<HTMLElement>(FOCUSABLE);
      (first ?? content).focus();
    }

    return () => {
      document.documentElement.style.overflow = "";
      // Возврат фокуса — в следующем кадре: закрытие диалога обычно меняет
      // состояние родителя, и на момент cleanup триггер может быть ещё не
      // перерисован. `isConnected` отсекает случай, когда его размонтировали.
      const target = previouslyFocused.current;
      requestAnimationFrame(() => {
        if (target?.isConnected) target.focus();
      });
    };
  }, [open]);

  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent<HTMLDivElement>) => {
      if (event.key === "Escape") {
        event.stopPropagation();
        onClose?.();
        return;
      }

      if (event.key !== "Tab") return;

      // Focus trap: Tab по кругу внутри диалога.
      const content = contentRef.current;
      if (!content) return;
      const focusable = Array.from(
        content.querySelectorAll<HTMLElement>(FOCUSABLE)
      ).filter((el) => el.offsetParent !== null);
      if (focusable.length === 0) {
        event.preventDefault();
        return;
      }

      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      const active = document.activeElement;

      if (event.shiftKey && (active === first || active === content)) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && active === last) {
        event.preventDefault();
        first.focus();
      }
    },
    [onClose]
  );

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
      onKeyDown={handleKeyDown}
      {...props}
    >
      <div className={s["dialog-backdrop"]} aria-hidden="true"></div>
      <div
        className={s["dialog-container"]}
        role="presentation"
        onMouseDown={handleMouseDown}
      >
        <div
          ref={contentRef}
          className={s["dialog-content"]}
          role="dialog"
          aria-modal="true"
          aria-labelledby={label ? labelId : undefined}
          tabIndex={-1}
        >
          {label && (
            <span id={labelId} className={s.srOnly}>
              {label}
            </span>
          )}
          {children}
        </div>
      </div>
    </div>,
    document.body
  );
};

export default Dialog;
