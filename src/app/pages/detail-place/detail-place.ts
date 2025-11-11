import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { PlacesService } from '../../services/places-service';
import { AccommodationDetailDTO } from '../../models/place-dto';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-detail-place',
  imports: [CommonModule],
  templateUrl: './detail-place.html',
  styleUrl: './detail-place.css'
})
export class DetailPlace implements OnInit {

  placeId: string = "";
  place: AccommodationDetailDTO | undefined;
  currentImageIndex = 0;

  constructor(
    private route: ActivatedRoute,
    private placesService: PlacesService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.route.params.subscribe((params) => {
      this.placeId = params["id"];
      this.loadPlaceDetail(this.placeId);
    });
  }

  private loadPlaceDetail(placeId: string): void {
    // Por ahora usamos datos mock ya que no tenemos el endpoint del backend
    this.place = this.getMockPlaceDetail(parseInt(placeId));
  }

  private getMockPlaceDetail(id: number): AccommodationDetailDTO {
    return {
      id: id,
      title: 'Casa de Campo El Roble',
      description: 'Hermosa casa de campo rodeada de naturaleza, perfecta para descansar y disfrutar de la tranquilidad. Cuenta con todas las comodidades necesarias para una estadía inolvidable.',
      price: 250000,
      capacity: 6,
      averageRating: 4.8,
      latitude: 5.0703,
      longitude: -75.5138,
      picsUrl: [
        'https://example.com/images/campo1.jpg',
        'https://example.com/images/campo2.jpg',
        'https://example.com/images/campo3.jpg',
        'https://example.com/images/campo4.jpg'
      ],
      amenities: ['WIFI', 'PARKING_AND_FACILITIES', 'KITCHEN', 'HOT_WATER'],
      userDetailDTO: {
        id: '1',
        name: 'María González',
        photoUrl: 'https://example.com/profiles/maria.jpg',
        createdAt: '2024-01-15T10:30:00'
      }
    };
  }

  // Métodos para el carrusel de imágenes
  nextImage(): void {
    if (this.place && this.place.picsUrl.length > 0) {
      this.currentImageIndex = (this.currentImageIndex + 1) % this.place.picsUrl.length;
    }
  }

  prevImage(): void {
    if (this.place && this.place.picsUrl.length > 0) {
      this.currentImageIndex = this.currentImageIndex === 0
        ? this.place.picsUrl.length - 1
        : this.currentImageIndex - 1;
    }
  }

  goToImage(index: number): void {
    this.currentImageIndex = index;
  }

  // Método para generar array de estrellas para el rating
  getStars(rating: number): number[] {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;
    const stars = Array(fullStars).fill(1);

    if (hasHalfStar) {
      stars.push(0.5);
    }

    while (stars.length < 5) {
      stars.push(0);
    }

    return stars;
  }

  // Método para volver a la lista
  goBack(): void {
    this.router.navigate(['/my-places']);
  }

  // Método para navegar a crear reserva
  navigateToBooking(): void {
    this.router.navigate(['/create-booking', this.placeId]);
  }

  // Método para obtener el label de las comodidades
  getAmenityLabel(amenity: string): string {
    const amenityLabels: { [key: string]: string } = {
      'WIFI': 'WiFi',
      'PARKING_AND_FACILITIES': 'Parqueadero',
      'SERVICES': 'Aire acondicionado',
      'BEDROOM_AND_LAUNDRY': 'Lavandería',
      'SERVICE_ANIMALS_ALLOWED': 'Apto para mascotas',
      'FREEZER': 'Congelador',
      'HOT_WATER': 'Agua caliente',
      'KITCHEN': 'Cocina',
      'ENTERTAINMENT': 'TV'
    };
    return amenityLabels[amenity] || amenity;
  }
}