"use client";

import Image from "next/image";
import { useState, useEffect, useRef, useCallback } from "react";
import { Tabs } from "@base-ui/react/tabs";

const IMAGES = [
  { src: "/grid.png", alt: "Grid view", label: "Grid View", description: "Browse and manage your full glyph set" },
  { src: "/editor.png", alt: "Editor view", label: "Bezier Editor", description: "Edit outlines with precision bezier controls" },
  { src: "/text-mode.png", alt: "Text mode", label: "Text Mode", description: "Preview glyphs at low resolution" },
];

const AUTOPLAY_INTERVAL = 7000;

export function ImageCarousel() {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const resetTimer = useCallback(() => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    if (!paused) {
      intervalRef.current = setInterval(() => {
        setIndex((i) => (i === IMAGES.length - 1 ? 0 : i + 1));
      }, AUTOPLAY_INTERVAL);
    }
  }, [paused]);

  useEffect(() => {
    resetTimer();
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [resetTimer]);

  const handleValueChange = useCallback((value: number) => {
    setIndex(value);
    resetTimer();
  }, [resetTimer]);

  const goToNext = useCallback(() => {
    const next = (index + 1) % IMAGES.length;
    setIndex(next);
    resetTimer();
  }, [index, resetTimer]);

  return (
    <Tabs.Root
      value={index}
      onValueChange={handleValueChange}
      className="mx-auto w-full max-w-4xl"
    >
      <div
        className="group relative overflow-hidden"
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
      >
        <div
          className="relative aspect-video w-full cursor-pointer"
          onClick={goToNext}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              goToNext();
            }
          }}
          aria-label="Next screenshot"
        >
          {IMAGES.map((img, i) => (
            <Tabs.Panel
              key={img.src}
              value={i}
              keepMounted
              className="absolute inset-0 opacity-100 transition-opacity duration-700 ease-in-out data-hidden:opacity-0 data-hidden:pointer-events-none"
            >
              <Image
                src={img.src}
                alt={img.alt}
                fill
                className="object-contain"
                unoptimized
                priority
              />
            </Tabs.Panel>
          ))}
        </div>
      </div>

      <Tabs.List
        loopFocus
        aria-label="Image slides"
        className="mt-5 flex justify-center gap-3"
      >
        {IMAGES.map((img, i) => (
          <Tabs.Tab
            key={img.src}
            value={i}
            aria-label={`Go to slide ${i + 1}: ${img.label}`}
            className="group flex cursor-pointer flex-col items-center rounded-lg p-1 transition-all duration-300"
          >
            <span className="h-2 w-2 rounded-full bg-line transition-all duration-300 group-hover:bg-placeholder group-data-[active]:scale-110 group-data-[active]:bg-primary" />
          </Tabs.Tab>
        ))}
      </Tabs.List>
    </Tabs.Root>
  );
}
