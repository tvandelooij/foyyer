"use client";

import { Button } from "@/components/ui/button";
import { Authenticated, Unauthenticated } from "convex/react";
import { SignInButton, SignedIn, SignedOut, UserButton } from "@clerk/nextjs";
import Link from "next/link";

export function Header() {
  return (
    <header className="flex h-16 items-center justify-between gap-4 border-b px-4">
      <Link href="/" className="flex items-center gap-x-4">
        <span className="font-sans text-2xl font-bold text-yellow-300">
          foyyer
        </span>
      </Link>
      <div className="flex items-center gap-x-4">
        <Unauthenticated>
          <SignInButton>
            <Button variant="ghost">Inloggen</Button>
          </SignInButton>
        </Unauthenticated>
        <Authenticated>
          <UserButton />
        </Authenticated>
      </div>
    </header>
  );
}
