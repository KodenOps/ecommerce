import "@/app/globals.css";
import AppProviders from "@/components/AppProviders";

export default function App({ Component, pageProps }) {
  return (
    <AppProviders>
      <Component {...pageProps} />
    </AppProviders>
  );
}
