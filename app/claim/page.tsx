"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import Link from 'next/link';
import { Home } from 'lucide-react';

export default function ClaimLandingPage() {
    const [claimCode, setClaimCode] = useState('');
    const router = useRouter();

    const handleClaim = () => {
        if (claimCode.trim()) {
            router.push(`/claim/${claimCode.trim()}`);
        }
    };

    return (
        <div className="min-h-screen bg-yellow-100 dark:bg-yellow-900/50 text-black">
            <Link href="/" passHref>
                <Button variant="outline" className="fixed top-4 right-4 h-12 rounded-full bg-white border-2 border-black">
                    <Home className="h-5 w-5" />
                </Button>
            </Link>
            <main className="flex items-center justify-center min-h-screen px-4">
                <Card className="w-full max-w-md border-2 border-black bg-white text-center shadow-[8px_8px_0px_#000]">
                    <CardHeader>
                        <CardTitle className="text-3xl font-black uppercase">Claim Your Funds</CardTitle>
                        <CardDescription>
                            Enter the code you received to claim your payment.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <Input 
                            placeholder="Enter your claim code"
                            value={claimCode}
                            onChange={(e) => setClaimCode(e.target.value)}
                            className="h-14 text-center text-lg font-medium border-2 border-black focus-visible:ring-black"
                        />
                        <Button
                            onClick={handleClaim}
                            disabled={!claimCode.trim()}
                            className="w-full h-14 text-lg font-bold rounded-full bg-black text-white hover:bg-zinc-800"
                        >
                            Claim
                        </Button>
                    </CardContent>
                </Card>
            </main>
        </div>
    )
} 