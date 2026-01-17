"use client";

import React from "react";
import { Check, ChevronDown, Bookmark, Eye, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

export type ProductionStatus = "want_to_see" | "seen" | null;

interface ProductionStatusDropdownProps {
  status: ProductionStatus;
  onStatusChange: (status: ProductionStatus) => void;
  disabled?: boolean;
}

const statusConfig = {
  want_to_see: {
    label: "Wil ik zien",
    icon: Bookmark,
    className: "bg-yellow-200 text-red-950 border-red-950",
  },
  seen: {
    label: "Gezien",
    icon: Eye,
    className: "bg-lime-200 text-red-950 border-red-950",
  },
  null: {
    label: "Markeren",
    icon: null,
    className: "bg-stone-100 text-red-950 border-red-950",
  },
};

export function ProductionStatusDropdown({
  status,
  onStatusChange,
  disabled = false,
}: ProductionStatusDropdownProps) {
  const currentConfig = statusConfig[status ?? "null"];
  const CurrentIcon = currentConfig.icon;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild disabled={disabled}>
        <Button
          className={cn(
            "flex items-center gap-2 rounded-sm border-2 border-b-4 border-r-4 font-semibold text-sm",
            currentConfig.className,
          )}
        >
          {CurrentIcon && <CurrentIcon className="h-4 w-4" />}
          {currentConfig.label}
          <ChevronDown className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="center"
        className="rounded-sm border-2 border-red-950"
      >
        <DropdownMenuItem
          onClick={() => onStatusChange("want_to_see")}
          className="flex items-center gap-2 cursor-pointer"
        >
          <Bookmark className="h-4 w-4" />
          <span>Wil ik zien</span>
          {status === "want_to_see" && (
            <Check className="h-4 w-4 ml-auto text-lime-600" />
          )}
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => onStatusChange("seen")}
          className="flex items-center gap-2 cursor-pointer"
        >
          <Eye className="h-4 w-4" />
          <span>Gezien</span>
          {status === "seen" && (
            <Check className="h-4 w-4 ml-auto text-lime-600" />
          )}
        </DropdownMenuItem>
        {status !== null && (
          <DropdownMenuItem
            onClick={() => onStatusChange(null)}
            className="flex items-center gap-2 cursor-pointer text-gray-500"
          >
            <X className="h-4 w-4" />
            <span>Verwijderen</span>
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

// Helper function to derive status from existing data
export function deriveStatus(
  hasLiked: boolean | undefined,
  review: { visited?: boolean; rating?: number | null } | null | undefined,
): ProductionStatus {
  // If user has marked as visited or has a rating, they've seen it
  if (review?.visited === true || (review?.rating && review.rating > 0)) {
    return "seen";
  }
  // If user has liked/bookmarked, they want to see it
  if (hasLiked) {
    return "want_to_see";
  }
  // No status
  return null;
}
