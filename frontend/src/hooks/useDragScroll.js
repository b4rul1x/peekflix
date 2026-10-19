import { useEffect } from "react";

export function useDragScroll(ref) {
  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    let isDown = false;
    let moved = false;
    let startX = 0;
    let startLeft = 0;

    const onMove = (e) => {
      if (!isDown) return;
      const dx = e.clientX - startX;
      if (Math.abs(dx) > 4) {
        moved = true;
        el.classList.add("is-dragging");
      }
      if (moved) el.scrollLeft = startLeft - dx;
    };

    const onUp = () => {
      isDown = false;
      el.classList.remove("is-dragging");
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
    };

    const onDown = (e) => {
      if (e.pointerType !== "mouse" || e.button !== 0) return;
      isDown = true;
      moved = false;
      startX = e.clientX;
      startLeft = el.scrollLeft;
      window.addEventListener("pointermove", onMove);
      window.addEventListener("pointerup", onUp);
    };

    const onClickCapture = (e) => {
      if (moved) {
        e.preventDefault();
        e.stopPropagation();
        moved = false;
      }
    };

    el.addEventListener("pointerdown", onDown);
    el.addEventListener("click", onClickCapture, true);

    return () => {
      el.removeEventListener("pointerdown", onDown);
      el.removeEventListener("click", onClickCapture, true);
      onUp();
    };
  }, []);
}