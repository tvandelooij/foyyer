import { Suspense } from "react";
import { auth } from "@clerk/nextjs/server";
import { SignInButton } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import { FeedClient } from "@/components/feed-client";
import { FeedSkeleton } from "@/components/feed-skeleton";
import { UserSync } from "@/components/user-sync";

export default async function Home() {
  const { userId } = await auth();

  return (
    <div className="flex flex-col my-4 pb-20 gap-4 sm:p-2 dark:bg-gray-900 dark:border-gray-700">
      <main className="flex flex-col items-center sm:items-start">
        {!userId ? (
          <SignInButton>
            <Button className="bg-orange-500 border-red-950 border-2 border-b-4 border-r-4 font-semibold text-white p-4 mx-auto">
              Log in
            </Button>
          </SignInButton>
        ) : (
          <div className="flex flex-col w-full">
            <UserSync />
            <Suspense fallback={<FeedSkeleton />}>
              <FeedClient userId={userId} />
            </Suspense>
          </div>
        )}
      </main>
    </div>
  );
}
