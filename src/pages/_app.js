import Head from "next/head";
import "@/app/globals.css";
import AppProviders from "@/components/AppProviders";
import { themeScript } from "@/lib/themeScript";

export default function App({ Component, pageProps }) {
  return (
    <AppProviders initialUser={pageProps?.user ?? null}>
      <Head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
        <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
        <meta name="theme-color" content="#fdf7f6" />
        <link rel="manifest" href="/manifest.webmanifest" />
        <link rel="apple-touch-icon" href="/icons/apple-touch-icon.png" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-title" content="QueenFizzie" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
      </Head>
      <Component {...pageProps} />
    </AppProviders>
  );
}
