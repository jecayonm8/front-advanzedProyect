import { Component, OnInit } from '@angular/core';
import { MapService } from '../../services/map-service';
import { RouterModule } from '@angular/router';
import { PlacesService } from '../../services/places-service';
import { MarkerDTO } from '../../models/marker-dto';
import { AccommodationDTO, CreateAccommodationDTO } from '../../models/place-dto';

@Component({
  selector: 'app-home',
  imports: [RouterModule],
  templateUrl: './home.html',
  styleUrl: './home.css'
})
export class Home implements OnInit {

  // Se inyecta el servicio de mapa en el constructor del componente
  constructor(private mapService: MapService, private placesService: PlacesService) { }

  ngOnInit(): void {
    this.mapService.create();
    // Obtiene todos los alojamientos del backend
    this.placesService.getAll().subscribe((places: AccommodationDTO[]) => {
      // Mapea los alojamientos a marcadores y los dibuja en el mapa
      const markers = this.mapItemToMarker(places);
      // Dibuja los marcadores en el mapa
      this.mapService.drawMarkers(markers);
    });
  }

  public mapItemToMarker(places: AccommodationDTO[]): MarkerDTO[] {
    return places.map((item) => ({
      id: item.id,
      title: item.title,
      price: item.price,
      photoUrl: item.photo_url || '',
      average_rating: item.average_rating,
      city: item.city,
      latitude: item.latitude,
      longitude: item.longitude,
    }));
  }
}
