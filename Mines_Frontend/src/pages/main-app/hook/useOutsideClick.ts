import { useEffect, useCallback } from "react";

function useOutsideClick(
  enabled: boolean = true,
  ref: React.RefObject<HTMLElement>,
  callback: () => void
) {
  const handleClickOutside = useCallback(
    (event: MouseEvent) => {
      // Check if the ref is available and the click is outside the element
      if (
        ref.current &&
        event.target instanceof Node &&
        !ref.current.contains(event.target)
      ) {
        callback();
      }
    },
    [ref, callback]
  );

  useEffect(() => {
    // Only add event listener if hook is enabled
    if (!enabled) return;

    // Add event listener to document
    document.addEventListener("mousedown", handleClickOutside);

    // Cleanup function to remove event listener
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [enabled, handleClickOutside]);
}

export default useOutsideClick;
