"use client";

import { Authenticated } from "convex/react";

export default function Page() {
  return (
    <Authenticated>
      <div className="mx-6">
        <div className="flex flex-col gap-6">
          <div className="text-2xl font-bold">Nieuwe groep</div>
        </div>
      </div>
    </Authenticated>
  );
}
