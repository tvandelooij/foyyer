"use client";

import React from "react";

import { Calendar, HomeIcon, Users, Drama } from "lucide-react";
import Link from "next/link";
import { Authenticated } from "convex/react";

const Navbar = () => {
  return (
    <Authenticated>
      <nav className="fixed bottom-0 left-0 w-full bg-white border-t border-gray-200 flex justify-between items-center h-14 z-50 dark:bg-gray-900 dark:border-gray-700">
        <div className="flex-1 flex justify-center">
          <Link
            href="/"
            className="text-gray-700 dark:text-gray-200 hover:text-blue-500 transition-colors flex flex-col items-center gap-1"
          >
            <HomeIcon className="h-4 w-4" />
            <div className="text-xs">Home</div>
          </Link>
        </div>
        <div className="flex-1 flex justify-center">
          <Link
            href="/agenda"
            className="text-gray-700 dark:text-gray-200 hover:text-blue-500 transition-colors flex flex-col items-center gap-1"
          >
            <Calendar className="h-4 w-4" />
            <div className="text-xs">Agenda</div>
          </Link>
        </div>
        <div className="flex-1 flex justify-center">
          <Link
            href="/shows"
            className="text-gray-700 dark:text-gray-200 hover:text-blue-500 transition-colors flex flex-col items-center gap-1"
          >
            <Drama className="h-4 w-4" />
            <div className="text-xs">Voorstellingen</div>
          </Link>
        </div>
        <div className="flex-1 flex justify-center">
          <Link
            href="/groepen"
            className="text-gray-700 dark:text-gray-200 hover:text-blue-500 transition-colors flex flex-col items-center gap-1"
          >
            <Users className="h-4 w-4" />
            <div className="text-xs">Groepen</div>
          </Link>
        </div>
      </nav>
    </Authenticated>
  );
};

export default Navbar;
