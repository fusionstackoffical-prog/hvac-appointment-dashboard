"use client";

import { useEffect, useRef, type ReactNode } from "react";

/** Native dialog provides focus containment, Escape and focus restoration. */
export default function Modal({ children, onClose, titleId }: { children: ReactNode; onClose: () => void; titleId: string }) {
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const dialog = ref.current;
    dialog?.showModal();
    return () => dialog?.close();
  }, []);
  return <dialog ref={ref} className="appointment-dialog" aria-labelledby={titleId} onCancel={(event) => { event.preventDefault(); onClose(); }}>{children}</dialog>;
}
