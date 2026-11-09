import type { Metadata, Viewport } from 'next';
import '@fontsource-variable/inter';
import '@fontsource-variable/manrope';
import './globals.css';

export const metadata: Metadata = {
  title: { default: 'BioLab 3D', template: '%s · BioLab 3D' },
  description: 'A Biologia ganha vida na sua aula. Laboratórios virtuais 3D para professores de Ciências e Biologia.',
  robots: { index: false, follow: false },
};

export const viewport: Viewport = {
  themeColor: '#07111F',
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  );
}
