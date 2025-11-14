"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";

interface ScienceSymbolProps {
  top: number;
  left: number;
  size: number;
  animationDuration: number;
  rotationDirection: "normal" | "reverse";
  opacity: number;
}

const ScienceSymbol: React.FC<ScienceSymbolProps> = ({
  top,
  left,
  size,
  animationDuration,
  rotationDirection,
  opacity,
}) => {
  const animationClass =
    rotationDirection === "reverse"
      ? "animate-spin-reverse-slow"
      : "animate-spin-slow";

  return (
    <div
      className="absolute pointer-events-none"
      style={{
        top: `${top}%`,
        left: `${left}%`,
        width: `${size}px`,
        height: `${size}px`,
        transform: `translate(-50%, -50%)`,
      }}
    >
      <div
        className={`w-full h-full ${animationClass}`}
        style={{
          opacity: opacity,
          animation: `${animationClass.includes('reverse') ? 'spin-reverse-slow' : 'spin-slow'} ${animationDuration}s linear infinite`,
        }}
      >
        <Image
          src="/Science.png"
          alt="Science symbol"
          width={size}
          height={size}
          className="w-full h-full object-contain"
        />
      </div>
    </div>
  );
};

export const ScienceBackground: React.FC = () => {
  // Generate random positions only on client-side to avoid hydration mismatch
  const [symbols, setSymbols] = useState<Array<{
    top: number;
    left: number;
    size: number;
    duration: number;
    direction: "normal" | "reverse";
    opacity: number;
  }>>([]);

  useEffect(() => {
    // Generate symbols only on client-side after hydration
    const symbolArray: Array<{
      top: number;
      left: number;
      size: number;
      duration: number;
      direction: "normal" | "reverse";
      opacity: number;
    }> = [];

    // Create 12 symbols with random positions
    for (let i = 0; i < 12; i++) {
      symbolArray.push({
        top: Math.random() * 100,
        left: Math.random() * 100,
        size: 40 + Math.random() * 60, // Size between 40-100px
        duration: 10 + Math.random() * 10, // Duration between 10-20s
        direction: Math.random() > 0.5 ? "normal" : "reverse",
        opacity: 0.2 + Math.random() * 0.3, // Opacity between 0.2-0.5 (increased for better visibility)
      });
    }
    setSymbols(symbolArray);
  }, []);

  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none z-[1]">
      {symbols.map((symbol, index) => (
        <ScienceSymbol
          key={index}
          top={symbol.top}
          left={symbol.left}
          size={symbol.size}
          animationDuration={symbol.duration}
          rotationDirection={symbol.direction}
          opacity={symbol.opacity}
        />
      ))}
    </div>
  );
};

