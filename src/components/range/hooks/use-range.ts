import { useEffect, useRef, useState, type KeyboardEvent } from "react";
import {
  getKeyboardValue,
  getPercentFromPointer,
  moveHandle,
  percentToValue,
  type Handle,
} from "../utils/range.utils";

type UseRangeOptions = {
  min: number;
  max: number;
};

export function useRange({ min, max }: UseRangeOptions) {
  const [selected, setSelected] = useState({ min, max });
  const [activeHandle, setActiveHandle] = useState<Handle | null>(null);
  const [lastHandle, setLastHandle] = useState<Handle>("max");
  const trackRef = useRef<HTMLDivElement>(null);

  function setValue(handle: Handle, value: number) {
    setLastHandle(handle);
    setSelected((current) => moveHandle(current, handle, value, { min, max }));
  }

  function startDragging(handle: Handle) {
    setLastHandle(handle);
    setActiveHandle(handle);
  }

  function handleKeyDown(handle: Handle) {
    return (event: KeyboardEvent<HTMLElement>) => {
      const value = getKeyboardValue(event.key, selected[handle], { min, max });
      if (value === null) return;

      event.preventDefault();
      setValue(handle, value);
    };
  }

  useEffect(() => {
    if (!activeHandle) return;
    const handle = activeHandle;

    function handlePointerMove(event: PointerEvent) {
      const track = trackRef.current;
      if (!track) return;

      const { left, width } = track.getBoundingClientRect();
      const percent = getPercentFromPointer(event.clientX, left, width);
      const value = percentToValue(percent, min, max);

      setSelected((current) =>
        moveHandle(current, handle, value, { min, max }),
      );
    }

    function stopDragging() {
      setActiveHandle(null);
    }

    document.body.style.cursor = "grabbing";
    window.addEventListener("pointermove", handlePointerMove);
    window.addEventListener("pointerup", stopDragging);
    window.addEventListener("pointercancel", stopDragging);

    return () => {
      document.body.style.cursor = "";
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerup", stopDragging);
      window.removeEventListener("pointercancel", stopDragging);
    };
  }, [activeHandle, min, max]);

  return {
    minValue: selected.min,
    maxValue: selected.max,
    activeHandle,
    topHandle: activeHandle ?? lastHandle,
    trackRef,
    setValue,
    startDragging,
    handleKeyDown,
  };
}
