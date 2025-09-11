import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/providers";
import Header from "@/components/layout/Header";
import SpotifyPlayer from "@/components/music/SpotifyPlayer";
import MainContent from "@/components/layout/MainContent";
import ErrorBoundary from "@/components/error/ErrorBoundary";
import AppError from "@/components/error/AppError";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Next Spotify",
  description: "Minimalistic Spotify Client",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <script src="https://sdk.scdn.co/spotify-player.js" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <Providers>
          <ErrorBoundary context="Header">
            <Header />
          </ErrorBoundary>
          <ErrorBoundary 
            context="Main Content"
            fallback={<AppError />}
          >
            <MainContent>
              {children}
            </MainContent>
          </ErrorBoundary>
          <ErrorBoundary 
            context="Spotify Player" 
            fallback={
              <div className="fixed bottom-0 left-0 right-0 bg-red-900/20 border-t border-red-700 p-4 z-50">
                <div className="max-w-screen-xl mx-auto text-center">
                  <p className="text-red-100 text-sm">
                    🎵 Player temporarily unavailable. Try refreshing the page.
                  </p>
                </div>
              </div>
            }
          >
            <SpotifyPlayer />
          </ErrorBoundary>
        </Providers>
      </body>
    </html>
  );
}
