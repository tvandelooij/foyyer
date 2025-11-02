"use client";

import { useConvexAuth, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { useEffect, useRef } from "react";

export function UserSync() {
  const { isAuthenticated } = useConvexAuth();
  const createUser = useMutation(api.users.createUser);
  const hasCreated = useRef(false);

  useEffect(() => {
    if (isAuthenticated && !hasCreated.current) {
      hasCreated.current = true;
      createUser();
    }
  }, [isAuthenticated, createUser]);

  return null;
}
