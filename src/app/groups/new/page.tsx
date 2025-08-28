"use client";

import { Authenticated, useMutation } from "convex/react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { api } from "../../../../convex/_generated/api";
import { useRouter } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import { useState } from "react";

export default function Page() {
  return (
    <Authenticated>
      <div className="mx-6 my-4">
        <div className="flex flex-col gap-6">
          <div className="text-2xl font-bold">Nieuwe groep aanmaken</div>
          <GroupForm />
        </div>
      </div>
    </Authenticated>
  );
}

function GroupForm() {
  const [isLoading, setIsLoading] = useState(false);

  const createGroup = useMutation(api.groups.createGroup);
  const addGroupMember = useMutation(api.group_members.addGroupMember);
  const user = useUser();
  const router = useRouter();

  const formSchema = z.object({
    name: z
      .string()
      .min(1, "Groepnaam is verplicht")
      .max(20, "Groepnaam is te lang"),
    description: z
      .string()
      .max(100, "Groepsbeschrijving is te lang")
      .optional(),
    visibility: z.enum(["public", "private"]),
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      description: "",
      visibility: "private",
    },
  });

  async function onSubmit(data: z.infer<typeof formSchema>) {
    setIsLoading(true);
    const groupId = await createGroup(data);
    const userId = user?.user?.id;

    if (!userId) {
      setIsLoading(false);
      throw new Error("User ID is undefined");
    }

    await addGroupMember({ groupId, userId });
    setIsLoading(false);

    router.push(`/groups/${groupId}`);
  }

  return (
    <Card className="border-none shadow-none bg-stone-50 p-1">
      <CardContent className="px-4 my-0 py-0">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem className="flex flex-col gap-2">
                  <FormLabel className="font-lg font-semibold">
                    Groepsnaam
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder='bijv. "coole groep 😎"'
                      className="text-base rounded-sm border-2 border-b-4 border-red-950"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem className="flex flex-col gap-2">
                  <FormLabel className="font-lg font-semibold">
                    Groepsbeschrijving
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder='bijv. "Een groep voor coole mensen..."'
                      className="text-base rounded-sm border-2 border-b-4 border-red-950"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="visibility"
              render={({ field }) => (
                <FormItem className="space-y-2 pt-4">
                  <FormLabel className="font-lg font-semibold">
                    Zichtbaarheid
                  </FormLabel>
                  <FormControl>
                    <RadioGroup
                      defaultValue={field.value}
                      onValueChange={field.onChange}
                      className="flex flex-row gap-8"
                    >
                      <div className="flex items-center flex-row gap-2">
                        <RadioGroupItem value="private" />
                        <Label>Privé</Label>
                      </div>
                      <div className="flex items-center flex-row gap-2">
                        <RadioGroupItem value="public" />
                        <Label>Openbaar</Label>
                      </div>
                    </RadioGroup>
                  </FormControl>
                </FormItem>
              )}
            />
            <div className="flex justify-center pt-6">
              <Button
                type="submit"
                className="bg-lime-200 rounded-xs shadow-none font-semibold text-black px-3 border-red-950 border-2 border-b-4 border-r-4 w-full"
                disabled={isLoading}
              >
                Groep aanmaken
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
