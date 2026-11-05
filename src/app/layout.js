import "./globals.css";
import { Playfair_Display, Poppins } from "next/font/google";
import AppProviders from "@/components/AppProviders";

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
  title: "Bloom & Glow — Beauty Bar",
  description:
    "Luminous skincare, scented rituals, and little luxuries for the glow you keep coming back to.",
  icons: { icon: "/favicon.ico" },
};

// Applied before paint so the stored/system theme never flashes.
const themeScript = `(function(){try{var s=localStorage.getItem('bloom:theme');var d=window.matchMedia('(prefers-color-scheme: dark)').matches;var t=(s==='light'||s==='dark')?s:(d?'dark':'light');var r=document.documentElement;if(t==='dark'){r.classList.add('dark');}r.dataset.theme=t;r.style.colorScheme=t;}catch(e){}})();`;

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
