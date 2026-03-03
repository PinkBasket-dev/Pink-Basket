import './globals.css' 
import type { Metadata } from 'next'
import Providers from './providers'
import WhatsAppFloat from "@/components/WhatsAppFloat"; 


export const metadata: Metadata = {
  title: 'Pink Basket',
  description: 'Pink Basket Shop Front',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
        <Providers>
          {children}
        </Providers>
         <WhatsAppFloat />
        
      </body>
    </html>
  );
}