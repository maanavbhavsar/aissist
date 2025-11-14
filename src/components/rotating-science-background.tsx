"use client";

import Image from "next/image";

export function RotatingScienceBackground() {
  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden -z-10">
      {/* Multiple Science.png images at various positions with rotation animations */}
      
      {/* Top Left */}
      <div className="absolute top-[10%] left-[5%] opacity-[0.08]">
        <Image 
          src="/Science.png" 
          alt="" 
          width={150} 
          height={150}
          className="animate-spin-slow"
          style={{ animationDuration: '20s' }}
        />
      </div>

      {/* Top Right */}
      <div className="absolute top-[15%] right-[8%] opacity-[0.1]">
        <Image 
          src="/Science.png" 
          alt="" 
          width={120} 
          height={120}
          className="animate-spin-reverse-slow"
          style={{ animationDuration: '25s' }}
        />
      </div>

      {/* Center Left */}
      <div className="absolute top-[50%] left-[3%] -translate-y-1/2 opacity-[0.06]">
        <Image 
          src="/Science.png" 
          alt="" 
          width={180} 
          height={180}
          className="animate-spin-slow"
          style={{ animationDuration: '30s' }}
        />
      </div>

      {/* Center Right */}
      <div className="absolute top-[45%] right-[5%] -translate-y-1/2 opacity-[0.09]">
        <Image 
          src="/Science.png" 
          alt="" 
          width={140} 
          height={140}
          className="animate-spin-reverse-slow"
          style={{ animationDuration: '22s' }}
        />
      </div>

      {/* Bottom Left */}
      <div className="absolute bottom-[12%] left-[7%] opacity-[0.07]">
        <Image 
          src="/Science.png" 
          alt="" 
          width={130} 
          height={130}
          className="animate-spin-slow"
          style={{ animationDuration: '28s' }}
        />
      </div>

      {/* Bottom Right */}
      <div className="absolute bottom-[8%] right-[4%] opacity-[0.08]">
        <Image 
          src="/Science.png" 
          alt="" 
          width={160} 
          height={160}
          className="animate-spin-reverse-slow"
          style={{ animationDuration: '24s' }}
        />
      </div>

      {/* Top Center */}
      <div className="absolute top-[8%] left-1/2 -translate-x-1/2 opacity-[0.05]">
        <Image 
          src="/Science.png" 
          alt="" 
          width={100} 
          height={100}
          className="animate-spin-slow"
          style={{ animationDuration: '26s' }}
        />
      </div>

      {/* Bottom Center */}
      <div className="absolute bottom-[10%] left-1/2 -translate-x-1/2 opacity-[0.06]">
        <Image 
          src="/Science.png" 
          alt="" 
          width={110} 
          height={110}
          className="animate-spin-reverse-slow"
          style={{ animationDuration: '32s' }}
        />
      </div>

      {/* Additional positions for better coverage */}
      {/* Top Left Corner */}
      <div className="absolute top-[5%] left-[2%] opacity-[0.04]">
        <Image 
          src="/Science.png" 
          alt="" 
          width={90} 
          height={90}
          className="animate-spin-reverse-slow"
          style={{ animationDuration: '35s' }}
        />
      </div>

      {/* Top Right Corner */}
      <div className="absolute top-[3%] right-[2%] opacity-[0.05]">
        <Image 
          src="/Science.png" 
          alt="" 
          width={95} 
          height={95}
          className="animate-spin-slow"
          style={{ animationDuration: '29s' }}
        />
      </div>

      {/* Middle Left */}
      <div className="absolute top-[30%] left-[1%] opacity-[0.06]">
        <Image 
          src="/Science.png" 
          alt="" 
          width={110} 
          height={110}
          className="animate-spin-reverse-slow"
          style={{ animationDuration: '27s' }}
        />
      </div>

      {/* Middle Right */}
      <div className="absolute top-[35%] right-[2%] opacity-[0.07]">
        <Image 
          src="/Science.png" 
          alt="" 
          width={125} 
          height={125}
          className="animate-spin-slow"
          style={{ animationDuration: '23s' }}
        />
      </div>

      {/* Bottom Left Corner */}
      <div className="absolute bottom-[3%] left-[2%] opacity-[0.05]">
        <Image 
          src="/Science.png" 
          alt="" 
          width={105} 
          height={105}
          className="animate-spin-slow"
          style={{ animationDuration: '31s' }}
        />
      </div>

      {/* Bottom Right Corner */}
      <div className="absolute bottom-[5%] right-[1%] opacity-[0.06]">
        <Image 
          src="/Science.png" 
          alt="" 
          width={115} 
          height={115}
          className="animate-spin-reverse-slow"
          style={{ animationDuration: '33s' }}
        />
      </div>
    </div>
  );
}

