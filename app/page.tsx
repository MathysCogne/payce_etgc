"use client";

import { usePrivy } from "@privy-io/react-auth";
import { useRouter } from "next/navigation";
import { Hero } from "@/components/Hero";
import { Toaster } from "sonner";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import Image from "next/image";

export default function Home() {
  const { ready, authenticated, login } = usePrivy();
  const router = useRouter();

  const handleActionClick = () => {
    if (authenticated) {
      router.push("/send");
    } else {
      login();
    }
  };

  return (
    <div className="flex flex-col md:flex-row min-h-screen text-black">
      <div className="relative w-full md:w-1/2 bg-gradient-to-br from-pink-400 to-orange-300 flex items-start justify-center p-8 pt-16 overflow-hidden">
        <Image
          src="/logo.svg"
          alt="App Logo"
          width={200}
          height={200}
          className="z-10"
        />
        <Image
          src="/illu.svg"
          alt="Illustration"
          layout="fill"
          objectFit="cover"
          className="absolute bottom-0 left-0 w-full h-auto"
        />
      </div>
      <main className="w-full md:w-1/2 bg-yellow-200 flex flex-col justify-center p-8 md:p-16">
        <Toaster richColors />
        <Hero />
        <div className="mt-8">
          <Button
            size="lg"
            variant="outline"
            className="h-14 px-8 text-lg font-bold rounded-full border-2 border-black bg-transparent hover:bg-black hover:text-white"
            onClick={handleActionClick}
            disabled={!ready}
             // C'est normal que sa soit le meme texte
          > 
             {"Refurb Your Friends Now !"}
              <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </div>
      </main>
    </div>
  );
}
