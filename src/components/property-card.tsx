"use client";

import { useState } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Heart, MessageCircle, Trash2 } from "lucide-react";

interface PropertyCardProps {
  images: string[];
  title: string;
  price: string;
  location: string;
  features: {
    rooms: number;
    size: number;
    bathrooms: number;
  };
  description: string;
}

export function PropertyCard({
  images,
  title,
  price,
  location,
  features,
  description,
}: PropertyCardProps) {
  const [currentImage, setCurrentImage] = useState(0);
  const [isFavorite, setIsFavorite] = useState(false);

  return (
    <Card className="overflow-hidden group">
      <div className="relative aspect-[4/3]">
        <Image
          src={images[currentImage]}
          alt={title}
          fill
          className="object-cover"
        />
        <div className="absolute top-2 left-2">
          <Badge className="bg-sky-500 text-white">SKY</Badge>
        </div>
        <div className="absolute bottom-2 right-2 bg-black/50 text-white px-2 py-1 text-sm rounded">
          {currentImage + 1}/{images.length}
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white"
          onClick={() =>
            setCurrentImage((prev) =>
              prev === 0 ? images.length - 1 : prev - 1
            )
          }
        >
          ←
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white"
          onClick={() =>
            setCurrentImage((prev) =>
              prev === images.length - 1 ? 0 : prev + 1
            )
          }
        >
          →
        </Button>
      </div>

      <div className="p-4">
        <div className="flex justify-between items-start mb-2">
          <div>
            <h3 className="text-2xl font-bold">{price}</h3>
            <p className="text-sm text-muted-foreground">{location}</p>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className={isFavorite ? "text-red-500" : ""}
            onClick={() => setIsFavorite(!isFavorite)}
          >
            <Heart className="w-5 h-5" />
          </Button>
        </div>

        <div className="flex gap-4 mb-4 text-sm">
          <div>{features.rooms} locali</div>
          <div>{features.size} m²</div>
          <div>{features.bathrooms} bagni</div>
        </div>

        <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
          {description}
        </p>

        <div className="flex gap-2">
          <Button variant="outline" className="flex-1">
            <MessageCircle className="w-4 h-4 mr-2" />
            MESSAGGIO
          </Button>
          <Button variant="ghost" size="icon">
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </div>

      <div className="hidden group-hover:flex gap-2 p-2 border-t">
        {images.map((_, index) => (
          <button
            key={index}
            className={`h-14 flex-1 relative ${
              index === currentImage ? "ring-2 ring-primary" : ""
            }`}
            onClick={() => setCurrentImage(index)}
          >
            <Image
              src={images[index]}
              alt={`${title} - Image ${index + 1}`}
              fill
              className="object-cover"
            />
          </button>
        ))}
      </div>
    </Card>
  );
}
