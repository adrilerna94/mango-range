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
  type SelectedRange,
} from "../utils/range.utils";

type UseRangeOptions = {
  min: number;
  max: number;
  /** Valor controlado. Si se pasa, el padre es quien lo actualiza. */
  value?: SelectedRange;
  /** Valor inicial en modo no controlado. */
  defaultValue?: SelectedRange;
  /** En cada cambio, también durante el arrastre. */
  onValueChange?: (value: SelectedRange) => void;
  /** Al terminar una interacción: soltar el tirador, una tecla o editar una etiqueta. */
  onValueCommit?: (value: SelectedRange) => void;
};

// Arrastre en curso: el puntero que lo controla, la posición de la barra al
// empezar (se lee una sola vez, no en cada movimiento) y los valores al
// empezar y en el último movimiento, para avisar al soltar solo si cambió.
type Drag = {
  pointerId: number;
  trackLeft: number;
  trackWidth: number;
  start: SelectedRange;
  latest: SelectedRange;
};

function isSameRange(a: SelectedRange, b: SelectedRange) {
  return a.min === b.min && a.max === b.max;
}

export function useRange({
  min,
  max,
  value,
  defaultValue,
  onValueChange,
  onValueCommit,
}: UseRangeOptions) {
  const [internal, setInternal] = useState(defaultValue ?? { min, max });
  const [activeHandle, setActiveHandle] = useState<Handle | null>(null);
  const [lastHandle, setLastHandle] = useState<Handle>("max");
  const trackRef = useRef<HTMLDivElement>(null);
  const dragRef = useRef<Drag | null>(null);

  // Si los límites cambian (p. ej. tras revalidar los datos) o el valor que
  // llega no es válido, se recoloca dentro del rango durante el render.
  const bounds = { min, max };
  const isControlled = value !== undefined;
  const current = clampRange(isControlled ? value : internal, bounds);

  // `moveHandle` devuelve el mismo objeto si el valor no cambia: en ese caso no
  // se actualiza el estado ni se avisa al padre.
  function update(handle: Handle, newValue: number, commit: boolean) {
    setLastHandle(handle);

    const next = moveHandle(current, handle, newValue, bounds);
    if (next === current) return current;

    if (!isControlled) setInternal(next);
    onValueChange?.(next);
    if (commit) onValueCommit?.(next);

    return next;
  }

  function setValue(handle: Handle, newValue: number) {
    update(handle, newValue, true);
  }

  function getPointerHandlers(handle: Handle) {
    function stopDragging(event: PointerEvent<HTMLElement>) {
      const drag = dragRef.current;
      if (!drag || drag.pointerId !== event.pointerId) return;

      dragRef.current = null;
      setActiveHandle(null);
      if (!isSameRange(drag.start, drag.latest)) onValueCommit?.(drag.latest);
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
          start: current,
          latest: current,
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
        drag.latest = update(handle, percentToValue(percent, min, max), false);
      },
      onPointerUp: stopDragging,
      onPointerCancel: stopDragging,
      onLostPointerCapture: stopDragging,
    };
  }

  function handleKeyDown(handle: Handle) {
    return (event: KeyboardEvent<HTMLElement>) => {
      const newValue = getKeyboardValue(event.key, current[handle], bounds);
      if (newValue === null) return;

      event.preventDefault();
      setValue(handle, newValue);
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
