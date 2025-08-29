import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDateDiff(timestamp: number): string {
  // Calculate time since review was posted
  const now = Date.now();
  const diffMs = now - timestamp;
  const diffMins = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  const diffMonths = Math.floor(diffDays / 30);
  const diffYears = Math.floor(diffDays / 365);

  let formattedDate = "";
  if (diffYears > 0) {
    formattedDate = `${diffYears} jaar`;
  } else if (diffMonths > 0) {
    formattedDate = `${diffMonths}m`;
  } else if (diffDays > 0) {
    formattedDate = `${diffDays}d`;
  } else if (diffHours > 0) {
    formattedDate = `${diffHours}u`;
  } else if (diffMins > 0) {
    formattedDate = `${diffMins}min`;
  } else {
    formattedDate = "zojuist";
  }

  return formattedDate;
}
