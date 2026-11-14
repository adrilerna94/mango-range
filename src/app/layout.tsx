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
      <body className="antialiased">
        <main className="grid min-h-screen place-items-center p-4">
          <div className="grid w-full max-w-md gap-6 rounded-2xl border border-border bg-surface p-6 shadow-sm">
            {children}
          </div>
        </main>
      </body>
    </html>
  );
}
