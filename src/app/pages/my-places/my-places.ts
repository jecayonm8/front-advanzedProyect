import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AccommodationDTO, AccommodationType, PlaceDTO } from '../../models/place-dto';
import { PlacesService } from '../../services/places-service';
import Swal from 'sweetalert2';

type SamplePlace = {
  id: string;
  title: string;
  price: number;
  photo_url: string;
  average_rating: number;
  city: string;
  type: string;
  location: string;
};

@Component({
  selector: 'app-my-places',
  imports: [CommonModule, RouterLink],
  templateUrl: './my-places.html',
  styleUrl: './my-places.css',
})
export class MyPlaces {

  places: AccommodationDTO[] = [];

  constructor(private placesService: PlacesService) {
    this.placesService.getAll().subscribe({
      next: (data) => this.places = data,
      error: (err) => console.error('Error loading places:', err)
    });
  }

  onDelete(placeId: string): void {
    Swal.fire({
      title: "¿Estás seguro?",
      text: "Esta acción cambiará el estado de los alojamientos a Eliminados.",
      icon: "error",
      showCancelButton: true,
      confirmButtonText: "Confirmar",
      cancelButtonText: "Cancelar",
    }).then((result) => {
      if (result.isConfirmed) {
        this.placesService.delete(placeId).subscribe({
          next: () => {
            this.places = this.places.filter(p => p.id !== placeId);
            Swal.fire("Eliminado!", "El alojamiento ha sido eliminado correctamente.", "success");
          },
          error: (err) => {
            console.error('Error deleting place:', err);
            Swal.fire("Error", "No se pudo eliminar el alojamiento.", "error");
          }
        });
      }
    });
  }
  protected readonly samplePlaces: SamplePlace[] = [
    {
      "id": "prop_001",
      "title": "Apartamento Luminoso en el Centro",
      "price": 120.50,
      "photo_url": "https://example.com/photos/apt_luz.jpg",
      "average_rating": 4.7,
      "city": "Madrid",
      "type": "Apartamento",
      "location": "Centro de Madrid"
    },
    {
      "id": "prop_002",
      "title": "Cabaña Rústica con Vista a la Montaña",
      "price": 75.00,
      "photo_url": "https://example.com/photos/cab_mont.jpg",
      "average_rating": 4.1,
      "city": "Bariloche",
      "type": "Cabaña",
      "location": "Montañas de Bariloche"
    },
    {
      "id": "prop_003",
      "title": "Loft Moderno cerca de la Playa",
      "price": 250.99,
      "photo_url": "https://example.com/photos/loft_playa.jpg",
      "average_rating": 4.9,
      "city": "Miami",
      "type": "Loft",
      "location": "Playa de Miami"
    },
    {
      "id": "prop_004",
      "title": "Estudio Económico para Viajeros",
      "price": 45.00,
      "photo_url": "https://example.com/photos/est_eco.jpg",
      "average_rating": 3.5,
      "city": "Ciudad de México",
      "type": "Estudio",
      "location": "Centro de Ciudad de México"
    },
  ];
}
