import { SessionProvider } from 'next-auth/react';
import { NextUIProvider } from '@nextui-org/react';
import type { AppProps } from 'next/app';
import '../styles/globals.css';
import { RoomProvider } from '../contexts/RoomContext';

export default function App({ Component, pageProps: { session, ...pageProps } }: AppProps) {
  return (
    <SessionProvider session={session}>
      <NextUIProvider>
        <RoomProvider>
          <Component {...pageProps} />
        </RoomProvider>
      </NextUIProvider>
    </SessionProvider>
  );
} 