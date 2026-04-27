import { useEffect, useRef, useState, type ReactNode, type CSSProperties } from "react";

type Direction = "up" | "down" | "left" | "right" | "fade" | "zoom";

interface RevealProps {
  children: ReactNode;
  direction?: Direction;
  delay?: number;        // ms
  duration?: number;     // ms
  distance?: number;     // px
  threshold?: number;
  once?: boolean;
  className?: string;
  as?: keyof JSX.IntrinsicElements;
}

/**
 * Reveal — scroll-triggered animation usando IntersectionObserver + CSS.
 * Mais leve que framer-motion para o caso comum de "aparecer ao rolar".
 */
export function Reveal({
  children,
  direction = "up",
  delay = 0,
  duration = 700,
  distance = 28,
  threshold = 0.12,
  once = true,
  className = "",
  as: Tag = "div",
}: RevealProps) {
  const ref = useRef<HTMLElement | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    // Respeita prefers-reduced-motion
    const prefersReduced =
      typeof window !== "undefined" &&
      window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    if (prefersReduced) {
      setVisible(true);
      return;
    }

    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setVisible(true);
            if (once) io.unobserve(entry.target);
          } else if (!once) {
            setVisible(false);
          }
        }
      },
      { threshold, rootMargin: "0px 0px -8% 0px" }
    );

    io.observe(el);
    return () => io.disconnect();
  }, [threshold, once]);

  const initialTransform = (() => {
    switch (direction) {
      case "up":    return `translate3d(0, ${distance}px, 0)`;
      case "down":  return `translate3d(0, -${distance}px, 0)`;
      case "left":  return `translate3d(${distance}px, 0, 0)`;
      case "right": return `translate3d(-${distance}px, 0, 0)`;
      case "zoom":  return `scale(0.94)`;
      case "fade":
      default:      return "none";
    }
  })();

  const style: CSSProperties = {
    opacity: visible ? 1 : 0,
    transform: visible ? "none" : initialTransform,
    transition: `opacity ${duration}ms cubic-bezier(0.22,1,0.36,1) ${delay}ms, transform ${duration}ms cubic-bezier(0.22,1,0.36,1) ${delay}ms`,
    willChange: visible ? "auto" : "opacity, transform",
  };

  return (
    // @ts-expect-error dynamic tag
    <Tag ref={ref} style={style} className={className}>
      {children}
    </Tag>
  );
}
