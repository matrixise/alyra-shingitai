import type { Metadata } from 'next';
import localFont from 'next/font/local';
import '@rainbow-me/rainbowkit/styles.css';
import './globals.css';
import { cn } from '@/lib/utils';
import Layout from '@/components/Layout';
import Providers from '@/app/CustomProviders';
import { ApolloClientProvider } from '@/components/appolo-wrapper';

const geistSans = localFont({
  src: './fonts/GeistVF.woff',
  variable: '--font-geist-sans',
  weight: '100 900',
});
const geistMono = localFont({
  src: './fonts/GeistMonoVF.woff',
  variable: '--font-geist-mono',
  weight: '100 900',
});

export const metadata: Metadata = {
  title: 'Shin Gi Tai - Member',
  description: 'Stéphane Wirtel',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={cn(
          geistSans.variable,
          geistMono.variable,
          'min-h-screen bg-background font-sans antialiased',
        )}
      >
        <Providers>
          <ApolloClientProvider>
            <Layout>
              <main className="container mx-auto p-6 flex-grow">
                {children}
              </main>
            </Layout>
          </ApolloClientProvider>
        </Providers>
      </body>
    </html>
  );
}
