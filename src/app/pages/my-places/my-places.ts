import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

type SamplePlace = {
  title: string;
  location: string;
  type: string;
  price: string;
  imageUrl: string;
};

@Component({
  selector: 'app-my-places',
  imports: [CommonModule, RouterLink],
  templateUrl: './my-places.html',
  styleUrl: './my-places.css',
})
export class MyPlaces {
  protected readonly samplePlaces: SamplePlace[] = [
    {
      title: 'Loft creativo en Medellín',
      location: 'El Poblado · Medellín, Colombia',
      type: 'Loft urbano',
      price: 'Desde $280.000 COP / noche',
      imageUrl: 'https://images.unsplash.com/photo-1484154218962-a197022b5858?auto=format&fit=crop&w=800&q=80',
    },
    {
      title: 'Casa campestre familiar',
      location: 'Filandia · Quindío, Colombia',
      type: 'Casa rural',
      price: 'Desde $430.000 COP / noche',
      imageUrl: 'https://images.unsplash.com/photo-1469796466635-455ede028aca?auto=format&fit=crop&w=800&q=80',
    },
    {
      title: 'Apartamento frente al mar',
      location: 'Bocagrande · Cartagena, Colombia',
      type: 'Apto. premium',
      price: 'Desde $520.000 COP / noche',
      imageUrl: 'https://images.unsplash.com/photo-1505692794403-34d4982d721d?auto=format&fit=crop&w=800&q=80',
    },
    {
      title: 'Cabin retreat',
      location: 'Guatavita · Cundinamarca, Colombia',
      type: 'Cabaña boutique',
      price: 'Desde $360.000 COP / noche',
      imageUrl: 'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=800&q=80',
    },
  ];
}
