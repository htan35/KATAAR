import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "@/components/Providers";

export const metadata: Metadata = {
  title: "KATAAR | Get E-Tickets Faster with AI",
  description: "Experience the convenience of booking e-tickets seamlessly through our AI chatbot interface. Say goodbye to long queues and complicated processes.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
