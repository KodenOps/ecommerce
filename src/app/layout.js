import "./globals.css";
import { Playfair_Display, Poppins } from "next/font/google";
import AppProviders from "@/components/AppProviders";
import { themeScript } from "@/lib/themeScript";

const playfair = Playfair_Display({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  style: ["normal", "italic"],
  variable: "--font-playfair",
  display: "swap",
});

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-poppins",
  display: "swap",
});

export const metadata = {
  title: "QueenFizzie — Naija Beauty, Delivered",
  description:
    "Original skincare, body rituals and scent blended for melanin-rich skin. Delivered nationwide from Lekki, Lagos.",
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
      <body className={`${playfair.variable} ${poppins.variable}`}>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
}
