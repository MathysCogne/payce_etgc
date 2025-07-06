"use client";

import { SendCard } from "@/components/custom/SendCard";
import { Toaster } from "sonner";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Home } from "lucide-react";

export default function SendPage() {
    return (
        <div className="min-h-screen bg-yellow-100 dark:bg-yellow-900/50 text-black">
            <Link href="/" passHref>
                <Button variant="outline" className="fixed top-4 right-4 h-12 rounded-full bg-white border-2 border-black">
                    <Home className="h-5 w-5" />
                </Button>
            </Link>
            <main className="relative flex flex-col items-center justify-center min-h-screen px-4">
                <Toaster richColors />
                <SendCard />
            </main>
        </div>
    )
} 