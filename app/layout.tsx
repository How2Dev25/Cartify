"use client";

import { useState, useEffect, Suspense } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Navbar } from "./components/landing/navbar";
import { Footer } from "./components/landing/footer";
import LoadingAnimation from "./components/loading";
const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// Remove metadata export since we're using "use client"
// Move metadata to a separate file or use next/head

function LayoutContent({ children }: { children: React.ReactNode }) {
  const [isLoading, setIsLoading] = useState(false);
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    // Start loading when route changes
    setIsLoading(true);
    
    // Simulate loading time (adjust based on your needs)
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 750); // shorter loading time for better UX
    
    return () => clearTimeout(timer);
  }, [pathname, searchParams]);

  return (
    <>
      {isLoading && <LoadingAnimation />}
      <Navbar />
      {children}
      <Footer />
    </>
  );
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <Suspense fallback={<LoadingAnimation />}>
          <LayoutContent>{children}</LayoutContent>
        </Suspense>
      </body>
    </html>
  );
}