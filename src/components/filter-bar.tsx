"use client";

import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Filter, MapPin } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export function FilterBar() {
  return (
    <div className="sticky top-0 z-50 bg-white border-b">
      <div className="flex items-center gap-2 p-2 overflow-x-auto">
        <Button variant="outline" className="flex items-center gap-2 min-w-fit">
          <Filter className="w-4 h-4" />
          TUTTI I FILTRI
          <Badge variant="secondary" className="ml-1">
            2
          </Badge>
        </Button>

        <Select>
          <SelectTrigger className="min-w-[150px] bg-white">
            <SelectValue placeholder="Compra" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="buy">Compra</SelectItem>
            <SelectItem value="rent">Affitta</SelectItem>
          </SelectContent>
        </Select>

        <Select>
          <SelectTrigger className="min-w-[200px] bg-white">
            <SelectValue placeholder="Case - Appartamenti" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="apartments">Case - Appartamenti</SelectItem>
            <SelectItem value="houses">Ville</SelectItem>
            <SelectItem value="commercial">Uffici</SelectItem>
          </SelectContent>
        </Select>

        <Button variant="outline" className="flex items-center gap-2 min-w-fit">
          <MapPin className="w-4 h-4" />
          Prezzo
        </Button>

        <Button variant="outline" className="min-w-fit">
          Superficie
        </Button>

        <Button variant="outline" className="min-w-fit">
          Locali
        </Button>

        <Button variant="outline" className="min-w-fit">
          Bagni
        </Button>

        <Button variant="outline" className="min-w-fit">
          Piano
        </Button>

        <Button variant="outline" className="min-w-fit">
          Altre caratteristiche
        </Button>

        <Button variant="destructive" className="min-w-fit ml-auto">
          SALVA RICERCA
        </Button>
      </div>
    </div>
  );
}
