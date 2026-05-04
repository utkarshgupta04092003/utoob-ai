"use client";

import Image from "next/image";
import { useState } from "react";

export function HighResImage({
  videoId,
  title,
}: {
  videoId: string;
  title: string;
}) {
  const [src, setSrc] = useState(
    `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`,
  );

  return (
    <Image
      unoptimized
      src={src}
      alt={title}
      className="object-cover w-full h-full transition-transform group-hover:scale-105 duration-300"
      fill
      priority
      onError={() => {
        setSrc(`https://img.youtube.com/vi/${videoId}/hqdefault.jpg`);
      }}
    />
  );
}
