import type { Metadata } from "next";
import type { ReactNode } from "react";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "Mango Range",
    template: "%s | Mango Range",
  },
  description: "Componente Range para la prueba técnica de Mango",
};

export default function RootLayout({
  children,
}: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="es">
      {/* Algunas extensiones del navegador (p. ej. ColorZilla añade
          `cz-shortcut-listen`) modifican los atributos de <body> antes de que
          React hidrate. Esto solo silencia las diferencias de atributos de
          este elemento, no las de sus hijos. */}
      <body className="antialiased" suppressHydrationWarning>
        <main className="grid min-h-screen place-items-center p-4">
          {/* En móvil el contenido ocupa todo el ancho; la card solo aparece desde sm. */}
          <div className="grid w-full gap-6 px-4 sm:max-w-md sm:rounded-2xl sm:border sm:border-border sm:bg-surface sm:p-6 sm:shadow-sm">
            {children}
          </div>
        </main>
      </body>
    </html>
  );
}
