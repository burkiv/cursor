import { ReactNode } from 'react';
import Menu from './Menu';

interface LayoutProps {
  children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  return (
    <div className="min-h-screen bg-background">
      <Menu />
      <main className="container mx-auto max-w-7xl pt-16">
        {children}
      </main>
    </div>
  );
} 