"use client";

import { Authenticated, Unauthenticated, useQuery } from "convex/react";
import { UserButton, useUser } from "@clerk/nextjs";
import Link from "next/link";

import { UserIcon, Bell, UserPlus } from "lucide-react";
import { useState } from "react";
import { InviteUserDialog } from "@/components/profile/invite-user-dialog";

import { useRouter } from "next/navigation";
import { api } from "../../convex/_generated/api";

export function Header() {
  const user = useUser();
  const [inviteDialogOpen, setInviteDialogOpen] = useState(false);

  return (
    <header className="flex h-16 items-center justify-between gap-4 px-4 relative border-b-2 border-red-950 dark:border-gray-200">
      <Authenticated>
        <div className="flex items-center min-w-[64px]">
          <UserButton>
            <UserButton.MenuItems>
              <UserButton.Link
                label="Profiel"
                labelIcon={<UserIcon className="h-4 w-4 flex items-center" />}
                href={`/profile/${user?.user?.id}`}
              />
            </UserButton.MenuItems>
          </UserButton>
        </div>
        <Link href="/" className="flex items-center gap-x-5">
          <span className="font-sans text-2xl font-bold px-2 pb-1 text-red-950 rounded-xs border-2 border-r-4 border-b-4 border-red-950 bg-yellow-200">
            foyyer
          </span>
        </Link>
        <div className="flex items-center gap-x-4 min-w-[64px] relative justify-end">
          <UserPlus
            className="h-5 w-5 text-red-950 cursor-pointer"
            onClick={() => setInviteDialogOpen(true)}
          />
          <NotificationBell />
        </div>
        <InviteUserDialog
          open={inviteDialogOpen}
          onOpenChange={setInviteDialogOpen}
        />
      </Authenticated>
      <Unauthenticated>
        <Link href="/" className="flex flex-row mx-auto items-center gap-x-5">
          <span className="font-sans text-2xl font-bold px-2 pb-1 text-red-950 rounded-xs border-2 border-r-4 border-b-4 border-red-950 bg-yellow-200">
            foyyer
          </span>
        </Link>
      </Unauthenticated>
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
