"use client";

import { useState } from "react";
import { useAction } from "convex/react";
import { api } from "../../../convex/_generated/api";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface InviteUserDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function InviteUserDialog({
  open,
  onOpenChange,
}: InviteUserDialogProps) {
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const sendInvitation = useAction(api.invitations.sendInvitation);

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleSend = async () => {
    setError(null);
    setSuccess(false);

    if (!email.trim()) {
      setError("Voer een e-mailadres in");
      return;
    }

    if (!validateEmail(email.trim())) {
      setError("Voer een geldig e-mailadres in");
      return;
    }

    setIsLoading(true);
    try {
      await sendInvitation({ email: email.trim() });
      setSuccess(true);
      setEmail("");
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Uitnodiging versturen mislukt. Probeer het opnieuw.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      // Reset state when closing
      setEmail("");
      setError(null);
      setSuccess(false);
    }
    onOpenChange(newOpen);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Uitnodigen</DialogTitle>
          <DialogDescription>
            Stuur een uitnodiging naar iemand om lid te worden van Foyyer.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-2">
          <Input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="E-mailadres"
            disabled={isLoading}
          />

          {error && (
            <p className="text-xs text-red-500 font-semibold">{error}</p>
          )}

          {success && (
            <p className="text-xs text-green-600 font-semibold">
              Uitnodiging verzonden!
            </p>
          )}
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => handleOpenChange(false)}
            disabled={isLoading}
            className="border-2 border-red-950 border-b-4 border-r-4 rounded-xs"
          >
            Sluiten
          </Button>
          <Button
            onClick={handleSend}
            disabled={isLoading || !email.trim()}
            className="bg-orange-500 hover:bg-orange-600 shadow-none rounded-xs border-2 border-b-4 border-r-4 border-red-950 text-white"
          >
            {isLoading ? "Versturen..." : "Versturen"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
