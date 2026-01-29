import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "SAESTL - Sistema de Gestión Financiera",
  description: "Sistema de Gestión Financiera para la Sociedad de Alumnos de la Escuela Superior de Tlahuelilpan",
  keywords: ["SAESTL", "UAEH", "Gestión Financiera", "Sociedad de Alumnos"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body className={`${inter.variable} font-sans antialiased`}>
        {children}
        <Toaster position="top-right" richColors />
      </body>
    </html>
  );
}
