import "./globals.css";
import { Playfair_Display, Poppins } from "next/font/google";
import Head from "next/head";
const playfair = Playfair_Display({
	subsets: ["latin"],
	weight: ["400", "600", "700"],
	style: ["normal", "italic"],
});
const poppins = Poppins({
	subsets: ["latin"],
	weight: ["300", "400", "500", "600", "700"],
});

export const metadata = {
	title: "Bloom & Glow — Beauty Bar",
	description: "Luminous skincare, radiant moods, little luxuries for your daily ritual.",
};

export default function RootLayout({ children }) {
	return (
		<html lang="en">
			<Head>
				<link rel="shortcut icon" href="/favicon.ico" />
				<link rel="preconnect" href="https://fonts.googleapis.com" />
				<link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
			</Head>
			<body className={`${playfair.className} ${poppins.className}`}>{children}</body>
		</html>
	);
}
