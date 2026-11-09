import type { Metadata } from "next";
import "./globals.css";
import "./reference-design.css";

export const metadata: Metadata = {
  title: "Cooperativa Inmigrar | Emprendimientos en Valparaíso",
  description: "Conoce los emprendimientos de Cooperativa Inmigrar y contacta para cotizar.",
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body className="antialiased">{children}</body>
    </html>
  );
}
