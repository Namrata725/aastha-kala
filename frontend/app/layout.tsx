import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import "./globals.css";
import ToastProvider from "@/components/layout/ToastProvider";
import { createTheme, MantineProvider } from "@mantine/core";
import "@mantine/core/styles.css";
import "@mantine/tiptap/styles.css";

// Updated Poppins configuration to be the application-wide font
const poppins = Poppins({
  subsets: ["latin"],
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
  variable: "--font-poppins",
});

export const metadata: Metadata = {
  title: "Aastha Kala | Dance & Arts Academy",
  description: "Learn dance, arts and more with Aastha Kala Academy.",
};

const theme = createTheme({
  fontFamily: "var(--font-poppins), sans-serif",
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${poppins.variable} ${poppins.className} antialiased`}>
        <MantineProvider theme={theme}>
          {children}
          <ToastProvider />
        </MantineProvider>
      </body>
    </html>
  );
}
