import Head from "next/head";
import "@/app/globals.css";
import AppProviders from "@/components/AppProviders";
import { themeScript } from "@/lib/themeScript";

export default function App({ Component, pageProps }) {
  return (
    <AppProviders>
      <Head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </Head>
      <Component {...pageProps} />
    </AppProviders>
  );
}
