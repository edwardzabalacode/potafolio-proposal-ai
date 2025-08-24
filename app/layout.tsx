import type { Metadata } from 'next'
import './globals.css'
import { AuthProvider } from '@/lib/contexts/auth-context'
import { AnalyticsProvider } from '@/components/providers/analytics-provider'

export const metadata: Metadata = {
  title: 'EdwardZabalaCode - Full Stack Developer | Portfolio',
  description:
    'Full Stack Developer specialized in web and mobile development. Portfolio of professional projects and experience.',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        <AuthProvider>
          <AnalyticsProvider>{children}</AnalyticsProvider>
        </AuthProvider>
      </body>
    </html>
  )
}
