"use client";

import {
  Authenticated,
  Unauthenticated,
  useConvexAuth,
  useMutation,
} from "convex/react";
import { api } from "../../convex/_generated/api";

import { SignInButton, useUser } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";

export default function Home() {
  const auth = useConvexAuth();
  const mutateUser = useMutation(api.users.createUser);
  const { user } = useUser();

  if (auth.isAuthenticated) {
    // add user data to convex and set user state
    mutateUser();
  }

  return (
    <div className="font-sans grid grid-rows-[20px_1fr_20px] items-center justify-items-center p-8 pb-20 gap-16 sm:p-20">
      <main className="flex flex-col gap-[32px] row-start-2 items-center sm:items-start">
        <Unauthenticated>
          <SignInButton>
            <Button>Log in</Button>
          </SignInButton>
        </Unauthenticated>
        <Authenticated>hello {user?.username}</Authenticated>
      </main>
    </div>
  );
}
