"use client";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { CountrySelect } from "@/components/custom/CountrySelect";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Header } from "@/components/Header";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { CodeInput } from "@/components/custom/CodeInput";
import { sendSMS, generateVerificationCode } from "@/lib/sms";
import { useState } from "react";
import { Info } from "lucide-react";

export default function SendPage() {
  const [countryCode, setCountryCode] = useState("+1");
  const [phone, setPhone] = useState("");
  const [amount, setAmount] = useState("");
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  
  // États pour la vérification SMS
  const [open, setOpen] = useState(false);
  const [verificationCode, setVerificationCode] = useState("");
  const [enteredCode, setEnteredCode] = useState("");

  const handleSend = async () => {
    if (!phone || !amount) return;
    
    setIsLoading(true);
    try {
      const code = generateVerificationCode();
      setVerificationCode(code);
      
      const fullPhone = countryCode + phone;
      
      // Créer le message SMS avec le message personnalisé
      let smsMessage = `Your verification code is: ${code}`;
      if (message.trim()) {
        smsMessage = `${message.trim()}\n\nYour verification code is: ${code}`;
      }
      
      await sendSMS(fullPhone, smsMessage);
      
      setOpen(true);
    } catch (error) {
      console.error('Failed to send SMS:', error);
      alert('Failed to send SMS. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyCode = () => {
    if (enteredCode === verificationCode) {
      // Code correct, procéder avec l'envoi d'argent
      setOpen(false);
      alert(`Code vérifié avec succès !\nEnvoi de ${amount} USD à ${countryCode}${phone}${message ? `\nMessage: ${message}` : ''}`);
      
      // Reset form
      setPhone("");
      setAmount("");
      setMessage("");
      setEnteredCode("");
      setVerificationCode("");
    } else {
      alert("Code incorrect, veuillez réessayer.");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50 dark:from-zinc-950 dark:via-zinc-900 dark:to-zinc-800">
      <Header />
      <main className="relative flex flex-col items-center justify-center px-4 py-8 sm:py-16">
        {/* Hero Section avec style cohérent */}
        <div className="text-center mb-12 sm:mb-16 max-w-4xl mx-auto">
          <div className="mx-auto h-16 w-16 rounded-full bg-gradient-to-r from-blue-500 to-green-400 flex items-center justify-center mb-6">
            <span className="text-white text-2xl"> 📩 </span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Send USD to Anyone
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400">
            Just enter the amount and we'll handle the rest!
          </p>
        </div>

        {/* Conteneur principal avec style cohérent */}
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

              {/* Section de saisie avec style cohérent */}
              <div className="space-y-4">
                <div className="flex items-center gap-3 p-3 bg-gradient-to-r from-blue-50/50 to-green-50/50 dark:from-blue-900/20 dark:to-green-900/20 rounded-lg border border-blue-200/50 dark:border-blue-700/50">
                  <span className="text-xl">💰</span>
                  <Input
                    placeholder="0.00"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    type="number"
                    className="h-11 text-base flex-1 border-0 bg-white/80 dark:bg-zinc-800/80"
                  />
                  <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">USD</span>
                </div>

                {/* Message Section - Connectée au SMS */}
                <div className="space-y-2">
                  <Label className="text-sm text-gray-600 dark:text-gray-400 font-medium">
                    Personal Message (Optional)
                  </Label>
                  <Textarea
                    placeholder="Add a personal message that will be sent with the SMS..."
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    className="min-h-[80px] resize-none border border-gray-200 dark:border-gray-700 bg-white/80 dark:bg-zinc-800/80"
                    maxLength={160}
                  />
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {message.length}/160 characters
                  </p>
                </div>

                {/* Send Button */}
                <Button
                  onClick={handleSend}
                  disabled={!phone.trim() || !amount.trim() || isLoading}
                  className="w-full h-12 text-base font-semibold bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-[1.02]"
                >
                  {isLoading ? "Sending SMS..." : "Send Money →"}
                </Button>
              </div>

              {/* Message d'encouragement */}
              <div className="mt-6 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                <p className="text-sm text-green-700 dark:text-green-300 text-center font-medium">
                  🎉 No wallet required for the recipient!
                </p>
              </div>

              {/* Info Section avec style cohérent */}
              <div className="mt-3 space-y-3">
              </div>
            </div>
          </div>
        </div>

        {/* Dialog de vérification - MÊME STYLE que page principale */}
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogContent className="max-w-sm w-[90vw] mx-auto rounded-2xl border-0 shadow-2xl bg-white/95 dark:bg-zinc-900/95 backdrop-blur-sm">
            <div className="relative">
              <DialogHeader className="text-center pb-2">
                <DialogTitle className="text-xl font-bold text-gray-900 dark:text-white">
                  Verify Your Transaction
                </DialogTitle>
              </DialogHeader>
              
              <div className="space-y-6">
                <p className="text-sm text-gray-600 dark:text-gray-400 text-center px-2">
                  Please enter the 6-digit code we sent to{" "}
                  <span className="font-semibold text-gray-900 dark:text-white">
                    {countryCode + phone}
                  </span>
                </p>
                
                {message && (
                  <div className="p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-200 dark:border-purple-800">
                    <p className="text-sm text-purple-700 dark:text-purple-300 text-center">
                      <span className="font-semibold">Your message:</span> "{message}"
                    </p>
                  </div>
                )}
                
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
                    Verify & Complete Transfer
                  </Button>
                  
                  <button 
                    onClick={() => handleSend()} 
                    className="w-full text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
                  >
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