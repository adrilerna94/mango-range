import {
  useEffect,
  useRef,
  useState,
  type KeyboardEvent,
  type PointerEvent,
} from "react";
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

// Arrastre en curso: el puntero que lo controla y la posición de la barra al
// empezar (se lee una sola vez, no en cada movimiento).
type Drag = {
  pointerId: number;
  trackLeft: number;
  trackWidth: number;
};

export function useRange({ min, max }: UseRangeOptions) {
  const [selected, setSelected] = useState({ min, max });
  const [activeHandle, setActiveHandle] = useState<Handle | null>(null);
  const [lastHandle, setLastHandle] = useState<Handle>("max");
  const trackRef = useRef<HTMLDivElement>(null);
  const dragRef = useRef<Drag | null>(null);

  // Si los límites cambian (p. ej. tras revalidar los datos), los valores
  // seleccionados se recolocan dentro del nuevo rango.
  const bounds = { min, max };
  const current = clampRange(selected, bounds);

  // `moveHandle` devuelve el mismo objeto si el valor no cambia, así que React
  // no vuelve a renderizar en los movimientos que no cambian el valor.
  function setValue(handle: Handle, value: number) {
    setLastHandle(handle);
    setSelected((previous) =>
      moveHandle(clampRange(previous, bounds), handle, value, bounds),
    );
  }

  function getPointerHandlers(handle: Handle) {
    function stopDragging(event: PointerEvent<HTMLElement>) {
      if (dragRef.current?.pointerId !== event.pointerId) return;

      dragRef.current = null;
      setActiveHandle(null);
    }

    return {
      onPointerDown(event: PointerEvent<HTMLElement>) {
        // Solo el botón principal (clic izquierdo, dedo o lápiz) y un único
        // arrastre a la vez: un segundo dedo no puede quitarle el tirador al
        // primero.
        if (event.button !== 0 || dragRef.current) return;

        const track = trackRef.current;
        if (!track) return;

        const { left, width } = track.getBoundingClientRect();
        // Con la captura, el tirador sigue recibiendo los eventos de este
        // puntero aunque salga de él o de la ventana.
        event.currentTarget.setPointerCapture(event.pointerId);
        dragRef.current = {
          pointerId: event.pointerId,
          trackLeft: left,
          trackWidth: width,
        };
        setLastHandle(handle);
        setActiveHandle(handle);
      },
      onPointerMove(event: PointerEvent<HTMLElement>) {
        const drag = dragRef.current;
        if (!drag || drag.pointerId !== event.pointerId) return;

        const percent = getPercentFromPointer(
          event.clientX,
          drag.trackLeft,
          drag.trackWidth,
        );
        setValue(handle, percentToValue(percent, min, max));
      },
      onPointerUp: stopDragging,
      onPointerCancel: stopDragging,
      onLostPointerCapture: stopDragging,
    };
  }

  function handleKeyDown(handle: Handle) {
    return (event: KeyboardEvent<HTMLElement>) => {
      const value = getKeyboardValue(event.key, current[handle], bounds);
      if (value === null) return;

      event.preventDefault();
      setValue(handle, value);
    };
  }

  // Mientras se arrastra, el cursor de arrastre se ve en toda la página, no
  // solo encima del tirador.
  useEffect(() => {
    if (!activeHandle) return;

    document.body.style.cursor = "grabbing";

    return () => {
      document.body.style.cursor = "";
    };
  }, [activeHandle]);

  return {
    minValue: current.min,
    maxValue: current.max,
    activeHandle,
    topHandle: activeHandle ?? lastHandle,
    trackRef,
    setValue,
    getPointerHandlers,
    handleKeyDown,
  };
}
