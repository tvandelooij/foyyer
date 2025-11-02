import { useEffect, useRef } from "react";

export type InfiniteScrollStatus =
  | "CanLoadMore"
  | "LoadingMore"
  | "Exhausted"
  | "LoadingFirstPage";

export interface UseInfiniteScrollOptions {
  status: InfiniteScrollStatus;
  loadMore: (numItems: number) => void;
  itemsPerPage?: number;
  rootMargin?: string;
}

export function useInfiniteScroll({
  status,
  loadMore,
  itemsPerPage = 10,
  rootMargin = "200px",
}: UseInfiniteScrollOptions) {
  const loaderRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (status !== "CanLoadMore") return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && status === "CanLoadMore") {
          loadMore(itemsPerPage);
        }
      },
      { rootMargin },
    );

    const loaderElem = loaderRef.current;
    if (loaderElem) {
      observer.observe(loaderElem);
    }

    return () => {
      if (loaderElem) {
        observer.unobserve(loaderElem);
      }
    };
  }, [status, loadMore, itemsPerPage, rootMargin]);

  return { loaderRef };
}
