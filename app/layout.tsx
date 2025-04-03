import '@/app/ui/global.css';
import NyraLogo from '@/app/ui/nyra-logo';
import { inter } from '@/app/ui/fonts';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${inter.className} antialiased`}>
        <main className="flex min-h-screen flex-col p-6">
          <div className="flex h-20 shrink-0 items-end rounded-lg bg-blue-500 p-4 md:h-52">
            <NyraLogo />
          </div>
          {children}
        </main>
      </body>
    </html>
  );
}
