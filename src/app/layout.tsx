import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "CRM Porto Alegre Oficial",
  description: "CRM local para operação comercial da Porto Alegre Oficial."
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  );
}
