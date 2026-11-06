import "./globals.css";
import AppProviders from "@/components/AppProviders";
import { themeScript } from "@/lib/themeScript";

export const metadata = {
  title: "QueenFizzie — Skin Care, Delivered",
  description:
    "Original skincare, body routines and scent blended for melanin-rich skin. Delivered nationwide from Lekki, Lagos.",
  applicationName: "QueenFizzie",
  manifest: "/manifest.webmanifest",
  themeColor: "#fdf7f6",
  icons: { icon: "/favicon.ico", apple: "/icons/apple-touch-icon.png" },
  appleWebApp: {
    capable: true,
    title: "QueenFizzie",
    statusBarStyle: "default",
  },
  formatDetection: { telephone: false },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
}
