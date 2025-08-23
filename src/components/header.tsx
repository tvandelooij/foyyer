"use client";

import { Authenticated, useQuery } from "convex/react";
import { UserButton, useUser } from "@clerk/nextjs";
import Link from "next/link";

import { Search, UserIcon, Bell } from "lucide-react";
import { useState, useRef, useEffect } from "react";

import { Input } from "@/components/ui/input";
import SearchResults from "./search/search-results";
import { useSearch } from "@/lib/search";
import { useRouter } from "next/navigation";
import { api } from "../../convex/_generated/api";

export function Header() {
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchValue, setSearchValue] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const debounceTimeout = useRef<NodeJS.Timeout | null>(null);

  const user = useUser();

  const { search } = useSearch();

  useEffect(() => {
    if (searchOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [searchOpen]);

  // Debounced search handler
  useEffect(() => {
    if (!searchOpen) {
      setSearchResults([]);
      setSearchValue("");
      return;
    }
    if (debounceTimeout.current) clearTimeout(debounceTimeout.current);
    if (searchValue.trim() === "") {
      setSearchResults([]);
      return;
    }
    debounceTimeout.current = setTimeout(() => {
      handleSearch(searchValue);
    }, 500);
    return () => {
      if (debounceTimeout.current) clearTimeout(debounceTimeout.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchValue, searchOpen]);

  async function handleSearch(query: string) {
    const result = await search(query);

    setSearchResults(result);
  }

  return (
    <header className="flex h-16 items-center justify-between gap-4 px-4 relative border-b-2 border-red-950">
      <Authenticated>
        <div className="flex items-center min-w-[64px]">
          <button
            onClick={() => setSearchOpen((v) => !v)}
            aria-label="Zoek vrienden"
          >
            <Search className="h-5 w-5 text-red-950 items-center" />
          </button>
        </div>
      </Authenticated>
      {/* Overlay search bar and results when open */}
      <div
        className="absolute left-0 right-0 mx-auto flex flex-col items-center z-20 px-4 transition-all duration-300"
        style={{
          pointerEvents: searchOpen ? "auto" : "none",
          opacity: searchOpen ? 1 : 0,
          background: searchOpen ? "rgba(255,255,255,0.95)" : undefined,
          transform: searchOpen ? "scale(1)" : "scale(0.98)",
        }}
      >
        <div
          tabIndex={-1}
          className="pt-20 w-full md:w-4/5 flex flex-col items-center relative"
          onBlur={(e) => {
            if (!e.currentTarget.contains(e.relatedTarget)) {
              setSearchOpen(false);
            }
          }}
        >
          <Input
            ref={inputRef}
            type="text"
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            placeholder="Zoeken..."
            className="w-full border rounded px-3 py-2 focus:outline-none focus:ring transition-all duration-300"
            onKeyDown={(e) => {
              if (e.key === "Escape") setSearchOpen(false);
            }}
            style={{
              opacity: searchOpen ? 1 : 0,
              transition: "opacity 0.3s",
            }}
            onBlur={() => {}}
          />
          {searchOpen && (
            <div
              onMouseDown={(e) => {
                e.preventDefault();
              }}
              className="w-full"
            >
              <SearchResults
                searchResults={searchResults}
                setSearchOpen={setSearchOpen}
              />
            </div>
          )}
        </div>
      </div>
      {!searchOpen && (
        <>
          <Link href="/" className="flex items-center gap-x-5">
            <span className="font-sans text-2xl font-bold px-2 pb-1 text-red-950 border-r-3 border-b-3 border-red-950 bg-yellow-200">
              foyyer
            </span>
          </Link>
          <Authenticated>
            <div className="flex items-center gap-x-4 min-w-[64px] relative">
              <NotificationBell />
              <UserButton>
                <UserButton.MenuItems>
                  <UserButton.Link
                    label="Profiel"
                    labelIcon={
                      <UserIcon className="h-4 w-4 flex items-center" />
                    }
                    href={`/profile/${user?.user?.id}`}
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

function NotificationBell() {
  const router = useRouter();
  const hasUnreadNotifications = useQuery(
    api.notifications.hasUnreadNotifications,
  );

  function handleNotificationClick(): void {
    router.push("/notifications");
  }

  return (
    <div className="relative" onClick={() => handleNotificationClick()}>
      <Bell className="h-5 w-5 text-red-950" />
      {hasUnreadNotifications && (
        <span className="absolute top-0 right-0 block h-2 w-2 rounded-full bg-red-600 ring-2 ring-white" />
      )}
    </div>
  );
}
