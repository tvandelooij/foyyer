import { Star } from "lucide-react";

export default function Stars({
  n,
  size,
}: {
  n: number | undefined;
  size: number;
}) {
  return (
    <div className="flex row items-center gap-1">
      {[1, 2, 3, 4, 5].map((star) => {
        const rating = Math.round((n ?? 0) * 2) / 2;
        let iconClass = `text-gray-300 h-${size} w-${size}`;
        let isHalf = false;
        if (star <= Math.floor(rating)) {
          iconClass = `text-yellow-500 fill-yellow-500 font-thin h-${size} w-${size}`;
        } else if (star === Math.ceil(rating) && rating % 1 === 0.5) {
          isHalf = true;
          iconClass = "text-yellow-500 font-thin h-4 w-4";
        }
        return (
          <span
            key={star}
            className={`relative inline-block h-${size} w-${size}`}
          >
            <Star className={iconClass + (isHalf ? " opacity-50" : "")} />
            {isHalf && (
              <Star
                className={`text-yellow-500 fill-yellow-500 font-thin h-${size} w-${size} absolute left-0 top-0`}
                style={{ clipPath: "inset(0 50% 0 0)" }}
              />
            )}
          </span>
        );
      })}
    </div>
  );
}
