"use client";

import { useState } from "react";
import { Header } from "@/components/Header";
import { Hero } from "@/components/Hero";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { CountrySelect } from "@/components/custom/CountrySelect";
import { CodeInput } from "@/components/custom/CodeInput";
import { sendSMS, generateVerificationCode } from "@/lib/sms";

export default function Home() {
  const [open, setOpen] = useState(false);
  const [phone, setPhone] = useState("");
  const [countryCode, setCountryCode] = useState("+1");
  const [isLoading, setIsLoading] = useState(false);
  const [verificationCode, setVerificationCode] = useState("");
  const [enteredCode, setEnteredCode] = useState("");

  const handleSubmit = async () => {
    if (!phone) return;
    
    setIsLoading(true);
    try {
      const code = generateVerificationCode();
      setVerificationCode(code);
      
      const fullPhone = countryCode + phone;
      await sendSMS(fullPhone, `Your verification code is: ${code}`);
      
      setOpen(true);
    } catch (error) {
      console.error('Failed to send SMS:', error);
      // Vous pouvez ajouter un toast ou une notification d'erreur ici
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyCode = () => {
    if (enteredCode === verificationCode) {
      // Code correct, procéder avec l'envoi d'argent
      setOpen(false);
      alert("Code vérifié avec succès !");
      // Ici vous pouvez ajouter la logique d'envoi d'argent
    } else {
      alert("Code incorrect, veuillez réessayer.");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50 dark:from-zinc-950 dark:via-zinc-900 dark:to-zinc-800">
      <Header />
      <main className="relative flex flex-col items-center justify-center px-4 py-8 sm:py-16">
        {/* Hero Section avec meilleur spacing */}
        <div className="text-center mb-12 sm:mb-16 max-w-4xl mx-auto">
          <Hero />
        </div>

        {/* Conteneur principal avec responsive design amélioré */}
        <div className="w-full max-w-lg mx-auto">
          <div className="relative bg-white/80 dark:bg-zinc-900/80 backdrop-blur-sm rounded-2xl border border-gray-200/50 dark:border-zinc-700/50 shadow-xl p-6 sm:p-8">
            {/* Effet de glow subtil */}
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-purple-500/5 rounded-2xl"></div>
            
            <div className="relative z-10">
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white mb-2">
                Send USD now
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
                Send USD instantly to any phone number
              </p>

              {/* Section de saisie avec meilleur spacing */}
              <div className="space-y-4">
                <div className="flex gap-3">
                  <div className="w-24 flex-shrink-0">
                    <CountrySelect value={countryCode} onChange={setCountryCode} />
                  </div>
                  <div className="flex-1">
                    <Input
                      placeholder="Phone Number"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="h-11 text-base"
                      type="tel"
                    />
                  </div>
                </div>

                <Button 
                  className="w-full h-12 text-base font-semibold bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-[1.02]" 
                  onClick={handleSubmit}
                  disabled={!phone.trim() || isLoading}
                >
                  {isLoading ? "Sending..." : "Send Money →"}
                </Button>
              </div>

              {/* Message d'encouragement avec meilleur style */}
              <div className="mt-6 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                <p className="text-sm text-green-700 dark:text-green-300 text-center font-medium">
                  🎉 No wallet required for the recipient!
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Dialog avec améliorations visuelles */}
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogContent className="max-w-sm w-[90vw] mx-auto rounded-2xl border-0 shadow-2xl bg-white/95 dark:bg-zinc-900/95 backdrop-blur-sm">
            <div className="relative">
              <DialogHeader className="text-center pb-2">
                <DialogTitle className="text-xl font-bold text-gray-900 dark:text-white">
                  Verification Code
                </DialogTitle>
              </DialogHeader>
              
              <div className="space-y-6">
                <p className="text-sm text-gray-600 dark:text-gray-400 text-center px-2">
                  Please enter the 6-digit code we sent to{" "}
                  <span className="font-semibold text-gray-900 dark:text-white">
                    {countryCode + phone}
                  </span>
                </p>
                
                <div className="flex justify-center">
                  <CodeInput 
                    length={6} 
                    onComplete={(code: string) => setEnteredCode(code)}
                  />
                </div>
                
                <div className="space-y-3">
                  <Button 
                    className="w-full h-12 text-base font-semibold bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 shadow-lg hover:shadow-xl transition-all duration-200"
                    onClick={handleVerifyCode}
                    disabled={enteredCode.length !== 6}
                  >
                    Verify Code
                  </Button>
                  
                  <button className="w-full text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors">
                    Didn't receive the code? Resend
                  </button>
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </main>
    </div>
  );
}
