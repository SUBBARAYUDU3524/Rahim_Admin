// app/layout.tsx
import Footer from './_components/Footer'
import Navbar from './_components/Navbar'

import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'My Website',
  description: 'Admin and User Portal with Firebase',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="flex flex-col min-h-screen">
        {/* Fixed Navbar */}
        <div className="fixed top-0 left-0 right-0 z-50">
          <Navbar />
        </div>

        {/* Main content with padding to avoid overlap */}
        <main className="flex-1 pt-16 pb-16">
          {children}
        </main>

        {/* Fixed Footer */}
        <div className="fixed bottom-0 left-0 right-0 z-50">
          <Footer />
        </div>
      </body>
    </html>
  )
}
