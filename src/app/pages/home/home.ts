import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { PlacesService } from '../../services/places-service';
import { MapService } from '../../services/map-service';
import { AccommodationDTO } from '../../models/place-dto';
import { MarkerDTO } from '../../models/marker-dto';

@Component({
  selector: 'app-home',
  imports: [CommonModule],
  templateUrl: './home.html',
  styleUrls: ['./home.css']
})
export class Home implements OnInit {
  places: AccommodationDTO[] = [];
  currentIndex = 0;

  constructor(private placesService: PlacesService, private mapService: MapService) {}

  ngOnInit(): void {
    this.placesService.getAll().subscribe(places => {
      this.places = places;
      this.currentIndex = this.places.length ? 0 : -1;

      // Inicializar mapa y dibujar marcadores
      this.mapService.create('map');
      const markers = this.mapItemToMarker(places);
      this.mapService.drawMarkers(markers);
    });
  }

  trackById(_: number, item: AccommodationDTO) {
    return item.title; // si tienes id, usa item.id
  }

  prev() {
    if (!this.places?.length) return;
    this.currentIndex = (this.currentIndex - 1 + this.places.length) % this.places.length;
  }

  next() {
    if (!this.places?.length) return;
    this.currentIndex = (this.currentIndex + 1) % this.places.length;
  }

  goTo(index: number) {
    if (!this.places?.length) return;
    this.currentIndex = index;
  }

  private mapItemToMarker(places: AccommodationDTO[]): MarkerDTO[] {
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
