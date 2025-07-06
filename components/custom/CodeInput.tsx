"use client";

import { useState, useRef } from "react";

interface CodeInputProps {
  length: number;
  onComplete?: (code: string) => void;
  className?: string;
}

export function CodeInput({ length, onComplete, className = "" }: CodeInputProps) {
  const [code, setCode] = useState<string[]>(Array(length).fill(""));
  const inputs = useRef<(HTMLInputElement | null)[]>([]);

  const handleChange = (index: number, value: string) => {
    if (value.length > 1) return;

    const newCode = [...code];
    newCode[index] = value;
    setCode(newCode);

    // Focus sur le champ suivant
    if (value && index < length - 1) {
      inputs.current[index + 1]?.focus();
    }

    // Appeler onComplete quand tous les champs sont remplis
    if (newCode.every(digit => digit !== "") && onComplete) {
      onComplete(newCode.join(""));
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    // Supprimer et revenir en arrière
    if (e.key === "Backspace" && !code[index] && index > 0) {
      inputs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text").slice(0, length);
    const newCode = [...code];
    
    for (let i = 0; i < pastedData.length && i < length; i++) {
      if (/^\d$/.test(pastedData[i])) {
        newCode[i] = pastedData[i];
      }
    }
    
    setCode(newCode);
    
    // Focus sur le dernier champ rempli + 1
    const lastFilledIndex = Math.min(pastedData.length, length - 1);
    inputs.current[lastFilledIndex]?.focus();
    
    // Appeler onComplete si tous les champs sont remplis
    if (newCode.every(digit => digit !== "") && onComplete) {
      onComplete(newCode.join(""));
    }
  };

  return (
    <div className={`flex justify-center gap-2 ${className}`}>
      {Array.from({ length }, (_, i) => (
        <input
          key={i}
          ref={(el) => {inputs.current[i] = el}}
          type="text"
          inputMode="numeric"
          pattern="[0-9]*"
          maxLength={1}
          value={code[i]}
          onChange={(e) => handleChange(i, e.target.value)}
          onKeyDown={(e) => handleKeyDown(i, e)}
          onPaste={handlePaste}
          className="w-14 h-16 text-center text-3xl font-bold border-2 border-black rounded-xl focus:ring-0 focus:border-black bg-zinc-100"
        />
      ))}
    </div>
  );
}
