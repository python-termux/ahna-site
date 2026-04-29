"use client";

import useEmblaCarousel from "embla-carousel-react";
import Autoplay from "embla-carousel-autoplay";
import Image from "next/image";

interface ImageSliderProps {
  images: string[];
  businessName: string;
}

export default function ImageSlider({ images, businessName }: ImageSliderProps) {
  const [emblaRef] = useEmblaCarousel({ loop: true }, [
    Autoplay({ delay: 4000, stopOnInteraction: false }),
  ]);

  if (!images.length) {
    return (
      <div className="w-full h-64 bg-gray-800 flex items-center justify-center rounded-xl">
        <span className="text-gray-500 text-sm">No photos available</span>
      </div>
    );
  }

  return (
    <div className="embla rounded-xl overflow-hidden" ref={emblaRef}>
      <div className="embla__container">
        {images.map((src, i) => (
          <div key={i} className="embla__slide relative h-72 sm:h-96">
            <Image
              src={src}
              alt={`${businessName} photo ${i + 1}`}
              fill
              className="object-cover"
              sizes="100vw"
              priority={i === 0}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
