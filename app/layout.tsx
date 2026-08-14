import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Julian wird 33 · WEIN AM STEIN 2027",
  description: "Eine Einladung für Julian Burg: Würzburg, Wein und ein Sommerabend am Stein.",
  robots: { index: false, follow: false },
  openGraph: {
    title: "Happy Birthday, Julian.",
    description: "Dein Geschenk: WEIN AM STEIN 2027.",
    type: "website",
    locale: "de_DE",
  },
};

export const viewport: Viewport = {
  themeColor: "#0c0b0b",
  colorScheme: "dark",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="de">
      <body>{children}</body>
    </html>
  );
}