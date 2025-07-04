"use client";

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

type Props = {
  value: string;
  onChange: (value: string) => void;
};

export const CountrySelect = ({ value, onChange }: Props) => {
  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger className="w-[90px]">
        <SelectValue placeholder="+1" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="+1">🇺🇸 +1</SelectItem>
        <SelectItem value="+33">🇫🇷 +33</SelectItem>
        <SelectItem value="+44">🇬🇧 +44</SelectItem>
        <SelectItem value="+91">🇮🇳 +91</SelectItem>
      </SelectContent>
    </Select>
  );
};
