import type { Metadata } from "next";
import { Inter, Roboto_Mono } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/lib/context/auth-context";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const robotoMono = Roboto_Mono({
  variable: "--font-roboto-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Punchly - Digital Snagging System",
  description: "Enterprise-grade digital snagging and handover platform for real estate",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${inter.variable} ${robotoMono.variable} antialiased font-sans`}
      >
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
