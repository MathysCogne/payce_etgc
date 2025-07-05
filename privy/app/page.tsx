'use client';

import { usePrivy } from '@privy-io/react-auth';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function Home() {
  const { ready, authenticated, login } = usePrivy();
  const router = useRouter();

  // If the user is authenticated, redirect them to the /send page
  useEffect(() => {
    if (ready && authenticated) {
      router.push('/send');
    }
  }, [ready, authenticated, router]);

  // Disable login button until Privy is ready
  const disableLogin = !ready || (ready && authenticated);

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <div className="text-center">
        <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-6xl">
          Payce
        </h1>
        <p className="mt-6 text-lg leading-8 text-gray-600">
          The simplest way to send USDC to your friends.
        </p>
        <div className="mt-10 flex items-center justify-center gap-x-6">
          <Button onClick={login} disabled={disableLogin}>
            Log in to get started
          </Button>
        </div>
      </div>
    </main>
  );
}
