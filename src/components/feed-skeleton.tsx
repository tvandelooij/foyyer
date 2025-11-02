import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export function FeedSkeleton() {
  return (
    <div className="flex flex-col gap-2">
      {[...Array(3)].map((_, i) => (
        <Card key={i} className="border-none">
          <CardHeader className="flex flex-row items-center gap-4">
            <Skeleton className="w-6 h-6 rounded-full" />
            <div className="flex flex-col gap-2 flex-1">
              <Skeleton className="h-4 w-3/4" />
            </div>
            <Skeleton className="h-3 w-12" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-3 w-full" />
            <Skeleton className="h-3 w-2/3 mt-2" />
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
