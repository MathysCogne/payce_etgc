'use client';

import { usePrivy } from '@privy-io/react-auth';
import { Button } from './ui/button';

export function Navbar() {
  const { ready, authenticated, user, login, logout } = usePrivy();

  return (
    <nav className="flex items-center justify-between p-4 bg-gray-100 border-b">
      <div className="text-lg font-bold">Payce</div>
      <div>
        {ready && authenticated && user?.wallet ? (
          <div className="flex items-center gap-4">
            <p className="text-sm text-gray-600 font-mono">
              {user.wallet.address}
            </p>
            <Button onClick={logout} variant="secondary">
              Log out
            </Button>
          </div>
        ) : (
          <Button onClick={login} disabled={!ready}>
            Log in
          </Button>
        )}
      </div>
    </nav>
  );
} 