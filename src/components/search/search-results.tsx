"use client";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import Image from "next/image";
import Link from "next/link";

interface SearchResult {
  userId: string | number;
  nickname: string;
  pictureUrl?: string;
}

interface SearchResultsProps {
  searchResults: SearchResult[];
  setSearchOpen?: (open: boolean) => void;
}

function SearchResults(props: SearchResultsProps) {
  return (
    <div className="w-full bg-white border rounded shadow z-30 mt-2">
      <div className="text-xs font-semibold text-gray-500 px-4 pt-2">
        Gebruikers
      </div>
      {props.searchResults.length === 0 && (
        <div className="px-4 py-2 text-gray-500 text-sm">
          Geen gebruikers gevonden
        </div>
      )}
      <ul>
        {props.searchResults.map((result: SearchResult) => (
          <li
            key={result.userId}
            className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
            onClick={() => props.setSearchOpen?.(false)}
          >
            <Link
              href={`/profile/${result.userId}`}
              className="flex flex-row items-center gap-4"
            >
              <Avatar>
                <AvatarImage
                  src={result.pictureUrl || ""}
                  alt={result.nickname}
                />
                <AvatarFallback>
                  <Image
                    src="/default-avatar.png"
                    width={8}
                    height={8}
                    alt={result.nickname}
                    className="w-8 h-8 rounded-full"
                  />
                </AvatarFallback>
              </Avatar>
              <span className="text-sm items-center">{result.nickname}</span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default SearchResults;
