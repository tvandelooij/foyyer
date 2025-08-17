"use client";

import { useParams } from "next/navigation";
import { useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import type { Id } from "../../../../convex/_generated/dataModel";
import Image from "next/image";

export default function ProfilePage() {
  const params = useParams();
  const id = params.id as Id<"users">;
  const user = useQuery(api.users.getUserById, { id });

  if (!user) return <div>Loading...</div>;

  return (
    <div className="items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20">
      <div>Profiel van {user.nickname}</div>
      <Image
        src={user.pictureUrl || "/default-avatar.png"}
        alt={user.nickname}
        className="w-16 h-16 rounded-full"
        width={64}
        height={64}
      />
      <div>Email: {user.email}</div>
    </div>
  );
}
