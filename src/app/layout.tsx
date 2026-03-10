import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Real Estate Dashboard',
  description: 'Manage offices, clients, and generate quotes',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        {children}
      </body>
    </html>
  );
}
