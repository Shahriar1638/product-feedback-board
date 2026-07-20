"use client";

import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

export default function BoardLoadSequence({ children }: { children: React.ReactNode }) {
  const scope = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    const mm = gsap.matchMedia();

    mm.add("(prefers-reduced-motion: no-preference)", () => {
      const tl = gsap.timeline({ defaults: { ease: "var(--ease-standard)" } });
      tl.from(".board-header", { opacity: 0, y: -12, duration: 0.4 })
        .from(".board-filters", { opacity: 0, y: -8, duration: 0.3 }, "-=0.15")
        .from(".feedback-card", {
          opacity: 0,
          y: 16,
          duration: 0.5,
          stagger: { amount: 0.5, grid: "auto", from: "start" },
        }, "-=0.1");

      // Scroll-driven filter bar compacting (DESIGN.md §4.2)
      ScrollTrigger.create({
        start: "top+=80 top",
        onEnter: () => gsap.to(".board-filters", { paddingTop: 8, paddingBottom: 8, duration: 0.25, ease: "var(--ease-inout)" }),
        onLeaveBack: () => gsap.to(".board-filters", { paddingTop: 16, paddingBottom: 16, duration: 0.25, ease: "var(--ease-inout)" }),
      });
    });

    mm.add("(prefers-reduced-motion: reduce)", () => {
      gsap.set(".board-header, .board-filters, .feedback-card", { opacity: 1, y: 0 });
    });
  }, { scope });

  return <div ref={scope}>{children}</div>;
}
