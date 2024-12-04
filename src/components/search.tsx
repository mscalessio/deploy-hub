"use client";

import { MapPin } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export function SearchBar() {
  return (
    <div className="bg-primary p-4">
      <div className="max-w-7xl mx-auto space-y-4">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Roma • Comune"
              className="pl-10 bg-white h-11"
            />
          </div>
          <Button className="bg-destructive hover:bg-destructive-hover h-11">
            CERCA
          </Button>
        </div>

        <div className="flex gap-2">
          <Select defaultValue="buy">
            <SelectTrigger className="bg-white min-w-[150px]">
              <SelectValue placeholder="Compra" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="buy">Compra</SelectItem>
              <SelectItem value="rent">Affitta</SelectItem>
            </SelectContent>
          </Select>

          <div className="relative flex-1">
            <Input placeholder="Prezzo min" className="bg-white" />
          </div>
          <div className="relative flex-1">
            <Input placeholder="Prezzo max" className="bg-white" />
          </div>

          <Select>
            <SelectTrigger className="bg-white min-w-[150px]">
              <SelectValue placeholder="Superficie" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="50">50+ m²</SelectItem>
              <SelectItem value="100">100+ m²</SelectItem>
              <SelectItem value="150">150+ m²</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
}
