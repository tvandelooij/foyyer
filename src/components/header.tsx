"use client";

import { Authenticated } from "convex/react";
import { UserButton } from "@clerk/nextjs";
import Link from "next/link";

import { Search, UserIcon } from "lucide-react";
import { useState, useRef, useEffect } from "react";

export function Header() {
  const [searchOpen, setSearchOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (searchOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [searchOpen]);

  return (
    <header className="flex h-16 items-center justify-between gap-4 border-b px-4 relative">
      <Authenticated>
        <div className="flex items-center min-w-[28px]">
          <button
            onClick={() => setSearchOpen((v) => !v)}
            aria-label="Zoek vrienden"
          >
            <Search className="h-7 w-7 text-gray-500" />
          </button>
        </div>
      </Authenticated>
      {/* Overlay search bar when open */}
      <div
        className={`absolute left-0 right-0 mx-auto flex items-center justify-center h-full z-20 px-4 transition-all duration-300 ${searchOpen ? "bg-white/95 opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"}`}
        style={{
          transform: searchOpen ? "scale(1)" : "scale(0.98)",
        }}
      >
        <input
          ref={inputRef}
          type="text"
          placeholder="Zoeken..."
          className="w-4/5 max-w-full border rounded px-3 py-2 focus:outline-none focus:ring transition-all duration-300"
          onBlur={() => setSearchOpen(false)}
          onKeyDown={(e) => {
            if (e.key === "Escape") setSearchOpen(false);
          }}
          style={{
            opacity: searchOpen ? 1 : 0,
            transition: "opacity 0.3s",
          }}
        />
      </div>
      {!searchOpen && (
        <>
          <Link href="/" className="flex items-center gap-x-4">
            <span className="font-sans text-2xl font-bold text-yellow-300">
              foyyer
            </span>
          </Link>
          <Authenticated>
            <div className="flex items-center gap-x-4 min-w-[28px]">
              <UserButton>
                <UserButton.MenuItems>
                  <UserButton.Link
                    label="Profiel"
                    labelIcon={
                      <UserIcon className="h-4 w-4 flex items-center" />
                    }
                    href="/profile"
                  />
                </UserButton.MenuItems>
              </UserButton>
            </div>
          </Authenticated>
        </>
      )}
    </header>
  );
}
