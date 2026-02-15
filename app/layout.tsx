import "./globals.css";

export const metadata = {
  title: "Clawbound",
  description: "Solana-only screener"
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-[#0b0f14] text-zinc-100 font-sans">
        {children}
      </body>
    </html>
  );
}
