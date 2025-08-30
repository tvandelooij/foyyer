import { useRouter } from "next/navigation";
import { Card, CardHeader, CardTitle } from "../ui/card";
import { Footprints, Music, Spotlight, Theater } from "lucide-react";

export function DiscoverCategories() {
  const router = useRouter();
  return (
    <div className="grid grid-cols-2 gap-4">
      <Card
        className="rounded-sm border-b-4 border-r-4 bg-indigo-300 text-white"
        onClick={() => router.push("/productions/category/toneel")}
      >
        <CardHeader>
          <CardTitle className="place-content-center gap-1 flex flex-row items-center">
            <Theater />
            <div>Toneel</div>
          </CardTitle>
        </CardHeader>
      </Card>

      <Card
        className="rounded-sm border-b-4 border-r-4 bg-indigo-300 text-white"
        onClick={() => router.push("/productions/category/muziek")}
      >
        <CardHeader className="p-0">
          <CardTitle className="place-content-center gap-1 flex flex-row items-center">
            <Music />
            <div>Muziektheater</div>
          </CardTitle>
        </CardHeader>
      </Card>

      <Card
        className="rounded-sm border-b-4 border-r-4 bg-indigo-300 text-white"
        onClick={() => router.push("/productions/category/amusementsvorm")}
      >
        <CardHeader className="p-0">
          <CardTitle className="place-content-center gap-1 flex flex-row items-center">
            <Spotlight />
            <div>Amusement</div>
          </CardTitle>
        </CardHeader>
      </Card>

      <Card
        className="rounded-sm border-b-4 border-r-4 bg-indigo-300 text-white"
        onClick={() => router.push("/productions/category/dans")}
      >
        <CardHeader>
          <CardTitle className="place-content-center gap-1 flex flex-row items-center">
            <Footprints />
            <div>Dans</div>
          </CardTitle>
        </CardHeader>
      </Card>
    </div>
  );
}
