# Mango Range

Componente `<Range />` para el design system de Mango, hecho con Next.js (App Router), React 19 y TypeScript, sin usar `<input type="range">`.

**Demo:** <https://mango-range-9cri.vercel.app>

| Ruta                                                          | Ejercicio                                                                                                  |
| ------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------- |
| [`/exercise1`](https://mango-range-9cri.vercel.app/exercise1) | Rango normal entre un mínimo y un máximo. Las etiquetas se pueden editar haciendo clic.                    |
| [`/exercise2`](https://mango-range-9cri.vercel.app/exercise2) | Rango de valores fijos. Solo se pueden elegir los valores de la lista y las etiquetas son de solo lectura. |

Los datos de los dos ejercicios llegan de un servicio HTTP mockeado:

- `GET /api/range` → `{ "min": 1, "max": 100 }`
- `GET /api/range-values` → `{ "rangeValues": [1.99, 5.99, 10.99, 30.99, 50.99, 70.99] }`

## Puesta en marcha

Requisitos: Node.js 22 o superior y npm. La versión está fijada en `.nvmrc` (y en `engines` de `package.json`), así que con nvm basta con `nvm use`.

```bash
nvm use                      # opcional, lee .nvmrc
npm ci
cp .env.example .env.local
npm run dev                  # http://localhost:8080
```

La variable `API_URL` indica la URL base del servicio HTTP. En local es `http://localhost:8080`, la propia app. Solo la lee el servidor, por eso no lleva el prefijo `NEXT_PUBLIC_` y no acaba en el JavaScript del navegador.

## Scripts

| Script                  | Qué hace                                                         |
| ----------------------- | ---------------------------------------------------------------- |
| `npm run dev`           | Servidor de desarrollo en el puerto 8080.                        |
| `npm run build`         | Build de producción.                                             |
| `npm run start`         | Sirve el build en el puerto 8080.                                |
| `npm run lint`          | ESLint.                                                          |
| `npm run format:check`  | Comprueba el formato con Prettier (`npm run format` lo corrige). |
| `npm run typecheck`     | `tsc --noEmit`.                                                  |
| `npm test`              | Vitest en modo watch.                                            |
| `npm run test:coverage` | Tests unitarios y de integración con cobertura.                  |
| `npm run test:e2e`      | Tests E2E con Playwright.                                        |

**E2E:** la primera vez instala el navegador con `npx playwright install chromium`. En local, Playwright arranca `npm run dev` (o reutiliza el que ya tengas en marcha); en CI usa el build de producción.

## Estructura

```
src/
├── app/
│   ├── (range)/                     # Route group: no cambia las URLs
│   │   ├── exercise1/
│   │   │   ├── page.tsx             # Título, ErrorBoundary + Suspense y enlace de vuelta
│   │   │   └── components/
│   │   │       └── normal-range.tsx # Server Component: pide los datos y pinta <Range>
│   │   └── exercise2/               # Igual, en modo "fixed"
│   ├── api/
│   │   ├── range/route.ts           # Mock HTTP
│   │   └── range-values/route.ts    # Mock HTTP
│   ├── layout.tsx
│   └── page.tsx                     # Portada con los enlaces a los ejercicios
├── components/
│   ├── range/                       # Componente del design system
│   │   ├── range.tsx                # API pública (Client Component)
│   │   ├── range-handle.tsx         # Tirador (role="slider")
│   │   ├── range-label.tsx          # Etiqueta de solo lectura o editable
│   │   ├── editable-label.tsx
│   │   ├── range-skeleton.tsx       # Fallback con la misma rejilla que <Range>
│   │   ├── hooks/                   # useRange, useEditableLabel
│   │   ├── utils/                   # Funciones puras: límites, porcentajes, teclado
│   │   └── __tests__/
│   └── ui/                          # Piezas genéricas: Skeleton, ErrorBoundary, ErrorState
└── lib/api/range.api.ts             # Capa de servicio: fetch, errores y validación
e2e/                                 # Playwright (escritorio y móvil)
```

## Arquitectura

**Datos y presentación están separados.** `<Range>` solo recibe números: no sabe de dónde salen. Los componentes de `exercise*/components/` son Server Components que llaman a la capa de servicio y le pasan los datos a `<Range>`. Así el componente se puede reutilizar en cualquier página, y en un design system real no tendría ninguna dependencia de la API.

**La frontera entre servidor y cliente es mínima.** Solo `range.tsx` lleva `"use client"`. Las páginas, el layout y los componentes que piden los datos se renderizan en el servidor.

**La capa de servicio no se fía de la respuesta.** `lib/api/range.api.ts`:

- envuelve cualquier fallo en un `ApiError` con el endpoint, el status y la causa original: red, timeout de 5 s, status HTTP o JSON inválido;
- valida la forma de los datos en tiempo de ejecución: números finitos, `min < max` y al menos dos valores fijos en orden ascendente.

**Servicio solo de servidor.** `range.api.ts` importa `server-only`: si un Client Component lo importara, el build fallaría.

**Renderizado: shell estático y datos en cada petición.** Con `cacheComponents`, Next hace _Partial Prerendering_ (en la tabla del build, `/exercise1` y `/exercise2` aparecen con ◐):

- el título, el enlace de vuelta y el `RangeSkeleton` se prerenderizan en el build y se sirven desde la CDN;
- las funciones del servicio llaman a `await connection()` antes del `fetch`, así que los datos no se piden nunca al compilar, sino en cada petición, y el rango llega por streaming dentro de su `Suspense`.

Por eso el build no necesita la API levantada.

**Carga y errores.** Cada rango va dentro de un `ErrorBoundary` y un `Suspense`, y los dos actúan en producción porque los datos se piden en cada visita:

- mientras llegan los datos se ve `RangeSkeleton`, que reproduce la rejilla y las alturas del componente para no provocar saltos de layout (CLS);
- si falla la carga, `ErrorState` muestra un mensaje propio (no el detalle técnico del error) y un botón "Reintentar" que vuelve a pedir los datos. El título y el enlace de vuelta siguen visibles.

Para verlo en local: `npm run build` y después `API_URL=http://localhost:9999 npm start`. La app sigue en el 8080, pero el servicio apunta a un puerto donde no escucha nada.

**Modo fijo con índices.** En modo `fixed`, el hook trabaja con las posiciones de la lista (de `0` a `n - 1`) y el componente las traduce a precios. Así los dos modos comparten exactamente la misma lógica de arrastre, teclado y límites.

## API del componente

```tsx
import { Range } from "@/components/range/range";

<Range mode="normal" min={1} max={100} />

<Range mode="fixed" values={[1.99, 5.99, 10.99, 30.99, 50.99, 70.99]} />
```

`RangeProps` es una unión discriminada por `mode`: TypeScript no deja combinar `min`/`max` con `values`.

Además, los dos modos aceptan una API controlada o no controlada con los mismos nombres que [Radix Slider](https://www.radix-ui.com/primitives/docs/components/slider). El valor es una tupla `RangeValue = [min, max]` y siempre son **precios**, también en modo fijo (internamente se trabaja con índices):

| Prop            | Tipo                          | Para qué                                                                                                                             |
| --------------- | ----------------------------- | ------------------------------------------------------------------------------------------------------------------------------------ |
| `defaultValue`  | `RangeValue`                  | Valor inicial si el componente no está controlado. Por defecto, los límites.                                                         |
| `value`         | `RangeValue`                  | Valor controlado. El padre lo actualiza en `onValueChange`.                                                                          |
| `onValueChange` | `(value: RangeValue) => void` | Cada cambio, también durante el arrastre. Sirve para pintar.                                                                         |
| `onValueCommit` | `(value: RangeValue) => void` | Una vez al terminar: al soltar el tirador (solo si el valor cambió), con cada tecla o al confirmar una etiqueta. Sirve para filtrar. |

Separar los dos eventos evita lanzar una búsqueda por cada píxel del arrastre. Si un valor no es válido, se ajusta igual que la entrada del usuario: dentro de los límites, sin cruzarse y, en modo fijo, al precio más cercano de la lista.

Ejemplo de sincronización con la URL. Las funciones no pueden pasar de un Server Component a uno de cliente, así que hace falta un pequeño wrapper `"use client"`:

```tsx
"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Range } from "@/components/range/range";

export function PriceFilter({ min, max }: { min: number; max: number }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  return (
    <Range
      mode="normal"
      min={min}
      max={max}
      defaultValue={[
        Number(searchParams.get("minPrice") ?? min),
        Number(searchParams.get("maxPrice") ?? max),
      ]}
      onValueCommit={([minPrice, maxPrice]) => {
        const params = new URLSearchParams(searchParams);
        params.set("minPrice", String(minPrice));
        params.set("maxPrice", String(maxPrice));
        router.replace(`${pathname}?${params}`, { scroll: false });
      }}
    />
  );
}
```

Comportamiento común a los dos modos:

- Los tiradores nunca salen de los límites ni se cruzan.
- Al pasar el ratón o arrastrar, el tirador se agranda y cambia el cursor.
- Se pueden arrastrar con ratón o con el dedo, y moverse con el teclado.

En modo `normal`, las etiquetas tienen siempre aspecto de campo (borde visible, no solo al pasar el ratón), así que también se ve que son editables en táctil. Al hacer clic aparece un campo para escribir el valor, con el `€` al lado y sin las flechas nativas de `type="number"`. Los dos estados miden lo mismo, así que no hay saltos de layout:

- **Enter o salir del campo** confirma. El valor se redondea y se ajusta a los límites.
- **Escape** cancela.

## Accesibilidad

- **Patrón ARIA _slider_:** cada tirador tiene `role="slider"`, nombre accesible y `aria-valuemin`, `aria-valuemax`, `aria-valuenow` y `aria-valuetext` (el precio formateado). Los límites de cada tirador se actualizan según la posición del otro.
- **Teclado:**

  | Tecla                 | Acción                        |
  | --------------------- | ----------------------------- |
  | `←` `↓` / `→` `↑`     | Un paso menos / más           |
  | `PageDown` / `PageUp` | Salto del 10 % del rango      |
  | `Home` / `End`        | Al límite inferior / superior |

- **Foco:** anillo visible con `focus-visible`. Al cerrar la edición de una etiqueta con Enter o Escape, el foco vuelve al botón.
- **Zona táctil:** el punto visible mide 16 px, pero la zona que responde al dedo mide 44 px (WCAG 2.5.8). Cuando los dos tiradores coinciden, queda encima el último que se ha movido.
- **Movimiento reducido:** las animaciones del skeleton respetan `prefers-reduced-motion`.
- **Lectores de pantalla:** el skeleton se anuncia con `role="status"` y los errores con `role="alert"`.
- **Móvil:** las etiquetas pasan a una fila encima de la barra, que ocupa todo el ancho.

## Tests

La estrategia evita probar lo mismo en varios niveles:

| Nivel       | Herramienta              | Qué cubre                                                                                                                                    |
| ----------- | ------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------- |
| Unitario    | Vitest                   | Funciones puras (`moveHandle` es el único sitio donde se prueban los límites y que no se crucen), hooks, servicio y mocks HTTP.              |
| Integración | Vitest + Testing Library | La API pública de `<Range>` en los dos modos, las etiquetas, el skeleton y el error boundary, consultando por rol como un usuario.           |
| E2E         | Playwright               | Lo que solo se puede comprobar en un navegador real: arrastre con ratón y con el dedo, hover, cursores, teclado, zona táctil y layout móvil. |

- **Volumen:** 137 tests unitarios y de integración, y 20 E2E (14 de escritorio y 6 de móvil en un Pixel 7 emulado).
- **Cobertura:** el informe de Vitest deja fuera `layout`, `page` y los componentes que piden los datos, porque solo componen piezas ya probadas y los cubren los E2E. En el resto se exige un mínimo del 90 % y ahora mismo está al 100 %.

## CI/CD

- **GitHub Actions** (`.github/workflows/ci.yml`) se ejecuta en cada PR contra `main`. No se repite al mergear, porque lo que entra en `main` ya se ha probado tal cual en el PR:
  - `checks`: lint, Prettier, typecheck, tests con umbrales de cobertura y build;
  - `e2e`: build de producción y Playwright en Chromium. Si falla, sube el informe como artefacto.
- **Protección de `main`** (ruleset): no se puede hacer push directo, solo mergear un PR con `checks` y `e2e` en verde y la rama al día con `main`. Tampoco se permiten force push ni borrar la rama.
- **Vercel** despliega `main` en producción y cada PR en un entorno de preview. `API_URL` se define en las variables de entorno del proyecto en Vercel. En CI, el job `e2e` la apunta a `localhost:8080`, así que los E2E prueban el mock del propio PR.

## Flujo de trabajo con git

- **Ramas** `<tipo>/<tema>` (por ejemplo, `feat/range-accessibility` o `refactor/range-structure`), una por cambio que se pueda revisar por separado.
- **Commits** con [Conventional Commits](https://www.conventionalcommits.org/): pequeños, con sus tests y dejando el repositorio en verde.
- **Integración:** cada rama entra en `main` mediante un PR con merge commit. El historial completo está en los PR #1–#11.

## Decisiones y trade-offs

- **El mock vive dentro de la propia app**, como Route Handlers. No hay dependencias externas y el contrato HTTP es real. La contrapartida es que el servidor se hace una petición HTTP a sí mismo, un salto de red que Next desaconseja. En un proyecto real la API sería un servicio aparte y este `fetch` sería el correcto.
- **Datos en cada petición en vez de `"use cache"`.** Antes los datos se prerenderizaban y se revalidaban cada hora: la página llegaba completa desde la CDN, pero el `Suspense` y el `ErrorBoundary` no llegaban a actuar en producción y el build dependía de una API levantada. Ahora solo el shell es estático: se ve un skeleton breve a cambio de datos siempre frescos, errores gestionados de verdad y un build independiente de la API. Si el rango cambiara poco y el tráfico fuera alto, volvería a cachear con `"use cache"` y `cacheLife`.
- **API pública mínima.** Solo se ha añadido lo necesario para usar el componente como filtro (`value`, `defaultValue`, `onValueChange` y `onValueCommit`, con los nombres de Radix). No hay `step` ni props de internacionalización porque hoy no los usa nadie: las props solo se amplían cuando aparece un caso real.
- **Arrastre con captura de puntero.** Al pulsar un tirador se llama a `setPointerCapture`, así que el tirador sigue recibiendo los eventos aunque el puntero salga de él o de la ventana, sin listeners en `window`. Solo arranca con el botón principal (no con clic derecho ni central) y se guarda el `pointerId`: un segundo dedo no puede quitarle el tirador al primero. Termina con `pointerup`, `pointercancel` o `lostpointercapture`.
- **Coste de cada `pointermove`.** La posición de la barra se lee una vez al empezar a arrastrar, no en cada movimiento, y `moveHandle` devuelve el mismo objeto si el valor no cambia, así que React solo vuelve a renderizar cuando el tirador cambia de valor. No hace falta `requestAnimationFrame`: los navegadores ya agrupan los `pointermove` a uno por frame.

## Siguientes pasos

- **Filtro de productos:** usar `onValueCommit` para sincronizar el rango con los parámetros de la URL (ver el ejemplo de arriba) y que el listado se filtre en el servidor.
- **Internacionalización:** los precios ya se formatean con `Intl.NumberFormat` en `es-ES` (`1 €`, `1,99 €`). Falta recibir el idioma, la moneda y los textos de las etiquetas por props o contexto (por ejemplo, `€1.99` en Irlanda).
- **Prop `step`** para pasos distintos de 1 o para céntimos.
- **Etiquetas de solo lectura con contexto** para los lectores de pantalla (mínimo y máximo).
- **Design system como paquete independiente:** extraerlo a `packages/ui` en un monorepo, con Storybook y tests visuales.
