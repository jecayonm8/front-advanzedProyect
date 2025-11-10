import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, Router } from '@angular/router';
import { AccommodationDTO, AccommodationType } from '../../models/place-dto';
import { PlacesService } from '../../services/places-service';

type SamplePlace = {
  id: number;
  title: string;
  location: string;
  type: AccommodationType;
  average_rating: number;
  price: number;
  photo_url: string;
};

@Component({
  selector: 'app-my-places',
  imports: [CommonModule, RouterLink],
  templateUrl: './my-places.html',
  styleUrl: './my-places.css',
})
export class MyPlaces {

  places: AccommodationDTO[] = [];

  constructor(private placesService: PlacesService, private router: Router) {
    this.placesService.getAll().subscribe(places => {
      this.places = places;
    });
  }

  public editPlace(place: AccommodationDTO): void {
    this.router.navigate(['/update-place'], {
      queryParams: { id: place.id }
    });
  }

  public deletePlace(place: AccommodationDTO): void {
    if (confirm(`¿Estás seguro de que deseas eliminar "${place.title}"?`)) {
      this.placesService.delete(place.id).subscribe({
        next: () => {
          // Actualizar la lista después de eliminar
          this.placesService.getAll().subscribe(places => {
            this.places = places;
          });
        },
        error: (error) => {
          console.error('Error al eliminar alojamiento:', error);
          alert('Error al eliminar el alojamiento');
        }
      });
    }
  }
  protected readonly samplePlaces: SamplePlace[] = [
    {
      id: 1,
      title: 'Apartamento creativo en Medellín',
      location: 'El Poblado · Medellín, Colombia',
      type: 'APARTMENT',
      average_rating: 4.8,
      price: 280000,
      photo_url: 'https://images.unsplash.com/photo-1484154218962-a197022b5858?auto=format&fit=crop&w=800&q=80',
    },
    {
      id: 2,
      title: 'Casa campestre familiar',
      location: 'Filandia · Quindío, Colombia',
      type: 'HOUSE',
      average_rating: 4.5,
      price: 430000,
      photo_url: 'https://images.unsplash.com/photo-1469796466635-455ede028aca?auto=format&fit=crop&w=800&q=80',
    },
    {
      id: 3,
      title: 'Apartamento frente al mar',
      location: 'Bocagrande · Cartagena, Colombia',
      type: 'APARTMENT',
      average_rating: 4.7,
      price: 520000,
      photo_url: 'https://unsplash.com/es/fotos/un-cuerpo-de-agua-con-un-monton-de-edificios-altos-en-el-fondo-cUjomI4gS40',
    },
    {
      id: 4,
      title: 'Finca de descanso en Guatavita',
      location: 'Guatavita · Cundinamarca, Colombia',
      type: 'FARM',
      average_rating: 4.9,
      price: 360000,
      photo_url: 'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=800&q=80',
    },
  ];
}
