import React, { useEffect, ReactNode, useRef } from "react";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: ReactNode;
  size?: "sm" | "md" | "lg";
}

const Modal = ({ isOpen, onClose, children, size = "sm" }: ModalProps) => {
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (isOpen && !dialog.open) {
      dialog.showModal();
    } else if (!isOpen && dialog.open) {
      dialog.close();
    }

    const handleCancel = (e: Event) => {
      e.preventDefault();
      onClose();
    };

    dialog.addEventListener("cancel", handleCancel);
    return () => dialog.removeEventListener("cancel", handleCancel);
  }, [isOpen, onClose]);

  if (!isOpen) return null;
  console.log("modal is rednered");
  return (
    <dialog ref={dialogRef} className="modal">
      <div className={`modal-box max-w-${size}`}>{children}</div>
    </dialog>
  );
};

export default Modal;
