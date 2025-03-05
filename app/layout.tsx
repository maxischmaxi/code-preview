import type { Metadata, Viewport } from "next";
import { Toaster } from "@/components/ui/sonner";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { QueryClientProvider } from "@/context/query";

const geistSans = Geist({
    variable: "--font-geist-sans",
    subsets: ["latin"],
});

const geistMono = Geist_Mono({
    variable: "--font-geist-mono",
    subsets: ["latin"],
});

export const viewport: Viewport = {
    width: "device-width",
    initialScale: 1,
    colorScheme: "light dark",
    themeColor: "#000000",
};

export const metadata: Metadata = {
    title: "Interview Code Challenge",
    description:
        "Ein leistungsstarker, minimalistischer Code-Editor für technische Interviews. Unterstützt verschiedene Programmiersprachen und ermöglicht kollaboratives Codieren in Echtzeit.",
    keywords: [
        "Code Interview",
        "Coding Challenge",
        "Online Code Editor",
        "Technisches Interview",
        "Live Coding",
        "Next.js Editor",
        "Programmierung",
        "Softwareentwicklung",
        "JavaScript",
        "TypeScript",
        "Coden im Browser",
    ],
    authors: [{ name: "Maximilian Jeschek", url: "https://jeschek.dev" }],
    creator: "Maximilian Jeschek",
    publisher: "Maximilian Jeschek",
    openGraph: {
        title: "Code Interview Editor – Interaktive Coding Challenges",
        description:
            "Ein leistungsstarker, minimalistischer Code-Editor für technische Interviews mit Echtzeit-Zusammenarbeit.",
        url: "https://code.jeschek.dev",
        siteName: "Code Interview Editor",
        type: "website",
    },
    robots: "index, follow",
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="de" suppressHydrationWarning>
            <body
                className={`${geistSans.variable} ${geistMono.variable} antialiased`}
            >
                <ThemeProvider
                    attribute="class"
                    defaultTheme="system"
                    enableSystem
                    disableTransitionOnChange
                >
                    <QueryClientProvider>
                        <main className="w-screen h-screen overflow-hidden">
                            {children}
                            <Toaster />
                        </main>
                    </QueryClientProvider>
                </ThemeProvider>
            </body>
        </html>
    );
}
