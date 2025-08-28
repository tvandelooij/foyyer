"use client";

import MultiSearch from "@/components/search/multi-search";
import { Authenticated } from "convex/react";

export default function Page() {
  return (
    <Authenticated>
      <div className="flex flex-col mx-6 my-4 pb-20 gap-4">
        <div className="flex flex-col gap-4">
          <div className="text-3xl font-bold text-red-950">Zoeken</div>
          <MultiSearch />
        </div>
      </div>
    </Authenticated>
  );
}
