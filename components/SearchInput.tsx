"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";

export default function SearchInput({ initial }: { initial: string }) {
  const [value, setValue] = useState(initial);
  const router = useRouter();
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
  }, []);

  function onChange(v: string) {
    setValue(v);
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => {
      router.replace(v ? `/search?q=${encodeURIComponent(v)}` : "/search");
    }, 350);
  }

  return (
    <div className="relative max-w-xl">
      <Search className="absolute left-3 top-1/2 size-5 -translate-y-1/2 text-muted" />
      <input
        type="search"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="O que queres ouvir ou ver?"
        autoFocus
        className="w-full rounded-full bg-elevated py-3 pl-11 pr-4 text-sm outline-none placeholder:text-muted focus:ring-2 focus:ring-white/30"
      />
    </div>
  );
}
