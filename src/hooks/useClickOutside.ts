import { useEffect, type RefObject } from "react";

type AnyElementRef = RefObject<HTMLElement | null>;

export function useClickOutside(
  refs: AnyElementRef | ReadonlyArray<AnyElementRef>,
  enabled: boolean,
  onOutside: () => void
) {
  useEffect(() => {
    if (!enabled) return;
    const list = (Array.isArray(refs) ? refs : [refs]) as ReadonlyArray<AnyElementRef>;
    function handler(e: MouseEvent) {
      const target = e.target as Node;
      // Ignore until at least one ref is mounted (preserves prior behavior).
      const mounted = list.filter((r) => r.current);
      if (mounted.length === 0) return;
      if (!mounted.some((r) => r.current!.contains(target))) {
        onOutside();
      }
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [refs, enabled, onOutside]);
}