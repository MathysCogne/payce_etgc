"use client";

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

type Props = {
  value: string;
  onChange: (value: string) => void;
};

export const CountrySelect = ({ value, onChange }: Props) => {
  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger className="w-auto border-0 bg-transparent focus:ring-0 focus:ring-offset-0 font-medium">
        <SelectValue placeholder="+1" />
      </SelectTrigger>
      <SelectContent className="border-2 border-black">
        <SelectItem value="+1">🇺🇸 +1</SelectItem>
        <SelectItem value="+33">🇫🇷 +33</SelectItem>
        <SelectItem value="+44">🇬🇧 +44</SelectItem>
        <SelectItem value="+91">🇮🇳 +91</SelectItem>
      </SelectContent>
    </Select>
  );
};
