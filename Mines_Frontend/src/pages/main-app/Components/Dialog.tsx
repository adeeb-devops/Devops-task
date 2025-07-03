import { useRef } from "react";
import useOutsideClick from "../hook/useOutsideClick";

interface DialogProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  style?: React.CSSProperties; // Style for the inner dialog box
  containerStyle?: React.CSSProperties; // Style for the overlay container
}

export default function Dialog({
  isOpen,
  onClose,
  children,
  style,
  containerStyle,
}: DialogProps) {
  const elementRef = useRef<HTMLDivElement | null>(null);
  useOutsideClick(isOpen, elementRef, onClose);
  // Ensure the modal only renders when isOpen is true
  if (!isOpen) return null;

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        background: "rgba(0, 0, 0, 0.5)",
        // display: "flex",
        // justifyContent: "center",
        // alignItems: "center",
        zIndex: 1000,
        ...containerStyle,
      }}
    >
      <div
        ref={elementRef}
        style={{
          ...style,
        }}
      >
        {children}
      </div>
    </div>
  );
}
