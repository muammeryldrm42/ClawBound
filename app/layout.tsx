import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "ClawBound Reboot",
  description: "ClawBound projesinin sıfırdan yeniden kurulan başlangıç sürümü"
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="tr">
      <body>{children}</body>
    </html>
  );
}
