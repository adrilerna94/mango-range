import { useEffect, useRef, useState, type KeyboardEvent } from "react";
import {
  clampRange,
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

  // Si los límites cambian (p. ej. tras revalidar los datos), los valores
  // seleccionados se recolocan dentro del nuevo rango.
  const bounds = { min, max };
  const current = clampRange(selected, bounds);

  function setValue(handle: Handle, value: number) {
    setLastHandle(handle);
    setSelected((previous) =>
      moveHandle(clampRange(previous, bounds), handle, value, bounds),
    );
  }

  function startDragging(handle: Handle) {
    setLastHandle(handle);
    setActiveHandle(handle);
  }

  function handleKeyDown(handle: Handle) {
    return (event: KeyboardEvent<HTMLElement>) => {
      const value = getKeyboardValue(event.key, current[handle], bounds);
      if (value === null) return;

      event.preventDefault();
      setValue(handle, value);
    };
  }

  useEffect(() => {
    if (!activeHandle) return;
    const handle = activeHandle;
    const limits = { min, max };

    function handlePointerMove(event: PointerEvent) {
      const track = trackRef.current;
      if (!track) return;

      const { left, width } = track.getBoundingClientRect();
      const percent = getPercentFromPointer(event.clientX, left, width);
      const value = percentToValue(percent, min, max);

      setSelected((previous) =>
        moveHandle(clampRange(previous, limits), handle, value, limits),
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
    minValue: current.min,
    maxValue: current.max,
    activeHandle,
    topHandle: activeHandle ?? lastHandle,
    trackRef,
    setValue,
    startDragging,
    handleKeyDown,
  };
}
