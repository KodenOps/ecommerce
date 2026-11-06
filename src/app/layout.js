import "./globals.css";
import AppProviders from "@/components/AppProviders";
import { themeScript } from "@/lib/themeScript";
import { poppins } from "@/lib/fonts";

export const metadata = {
  title: "QueenFizzie — Naija Beauty, Delivered",
  description:
    "Original skincare, body routines and scent blended for melanin-rich skin. Delivered nationwide from Lekki, Lagos.",
  icons: { icon: "/favicon.ico" },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={poppins.variable}>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
}
