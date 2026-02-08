"use client";

import Image from "next/image";
import { useState, useEffect, useRef, useCallback } from "react";
import { Tabs } from "@base-ui/react/tabs";

const IMAGES = [
  { src: "/grid.png", alt: "Grid view", label: "Grid View", description: "Browse and manage your full glyph set" },
  { src: "/editor.png", alt: "Editor view", label: "Bezier Editor", description: "Edit outlines with precision bezier controls" },
  { src: "/fill.png", alt: "Fill view", label: "Pixel Preview", description: "Preview glyphs at low resolution" },
];

const AUTOPLAY_INTERVAL = 4000;

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

  return (
    <Tabs.Root
      value={index}
      onValueChange={handleValueChange}
      className="w-full max-w-4xl mx-auto"
    >
      <div
        className="relative group overflow-hidden"
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
      >
        <div className="relative w-full aspect-video">
          {IMAGES.map((img, i) => (
            <Tabs.Panel
              key={img.src}
              value={i}
              keepMounted
              className="absolute inset-0 opacity-100 transition-opacity duration-700 ease-in-out data-[hidden]:opacity-0 data-[hidden]:pointer-events-none"
            >
              <Image
                src={img.src}
                alt={img.alt}
                fill
                className="object-contain"
                unoptimized
                priority={i === 0}
              />
            </Tabs.Panel>
          ))}
        </div>
      </div>

      <Tabs.List
        loopFocus
        aria-label="Image slides"
        className="flex justify-center gap-3 mt-5"
      >
        {IMAGES.map((img, i) => (
          <Tabs.Tab
            key={img.src}
            value={i}
            aria-label={`Go to slide ${i + 1}: ${img.label}`}
            className="group flex flex-col items-center px-1 py-1 rounded-lg cursor-pointer transition-all duration-300"
          >
            <span className="w-2 h-2 rounded-full transition-all duration-300 bg-neutral-300 group-hover:bg-neutral-400 group-data-[active]:bg-neutral-800 group-data-[active]:scale-110" />
          </Tabs.Tab>
        ))}
      </Tabs.List>
    </Tabs.Root>
  );
}
