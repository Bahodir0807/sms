import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "SMS Gateway | Eskiz.uz",
  description: "Интерфейс для массовой отправки SMS через Eskiz.uz",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ru" className="bg-[#0b0f19] text-slate-100">
      <body className="min-h-screen font-sans antialiased text-[11px] md:text-xs">
        {children}
      </body>
    </html>
  );
}