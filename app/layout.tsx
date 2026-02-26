import type { Metadata, Viewport } from 'next'
import './globals.css'

const SITE = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://mybranch.fun'

export const metadata: Metadata = {
  title: { default: 'mybranch.fun', template: '%s · mybranch.fun' },
  description: 'A living git tree. Fork a profile. Branch into communities. No accounts — just git.',
  metadataBase: new URL(SITE),
  openGraph: {
    siteName: 'mybranch.fun',
    type: 'website',
  },
  twitter: { card: 'summary' },
}

export const viewport: Viewport = {
  themeColor: '#010409',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Commit+Mono:ital,wght@0,100..700;1,100..700&family=Fraunces:ital,opsz,wght@0,9..144,100..900;1,9..144,100..900&family=JetBrains+Mono:ital,wght@0,100..800;1,100..800&display=swap"
          rel="stylesheet"
        />
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
      </head>
      <body>{children}</body>
    </html>
  )
}
