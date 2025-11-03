"use client";

import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";

interface EditBioDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentBio?: string;
}

export function EditBioDialog({
  open,
  onOpenChange,
  currentBio,
}: EditBioDialogProps) {
  const [bio, setBio] = useState(currentBio || "");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const updateProfile = useMutation(api.users.updateUserProfile);

  const handleSave = async () => {
    setError(null);

    // Validate bio length
    if (bio.length > 500) {
      setError("Bio must be 500 characters or less");
      return;
    }

    setIsLoading(true);
    try {
      await updateProfile({ bio: bio.trim() || undefined });
      onOpenChange(false);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to update bio. Please try again.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      // Reset state when closing
      setBio(currentBio || "");
      setError(null);
    }
    onOpenChange(newOpen);
  };

  const remainingChars = 500 - bio.length;
  const isOverLimit = remainingChars < 0;

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Bewerk bio</DialogTitle>
          <DialogDescription>
            Vertel anderen iets over jezelf. Maximaal 500 tekens.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-2">
          <Textarea
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            placeholder="Vertel iets over jezelf..."
            className="min-h-32"
            maxLength={600} // Allow typing over limit to show error
          />
          <div className="flex flex-row justify-between items-center">
            <p
              className={`text-xs ${
                isOverLimit
                  ? "text-red-500 font-semibold"
                  : remainingChars < 50
                    ? "text-orange-500"
                    : "text-gray-500"
              }`}
            >
              {remainingChars} tekens over
            </p>
          </div>

          {error && (
            <p className="text-xs text-red-500 font-semibold">{error}</p>
          )}
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => handleOpenChange(false)}
            disabled={isLoading}
            className="border-2 border-red-950 border-b-4 border-r-4 rounded-xs"
          >
            Annuleer
          </Button>
          <Button
            onClick={handleSave}
            disabled={isLoading || isOverLimit}
            className="bg-orange-500 hover:bg-orange-600 shadow-none rounded-xs border-2 border-b-4 border-r-4 border-red-950 text-white"
          >
            {isLoading ? "Opslaan..." : "Opslaan"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
