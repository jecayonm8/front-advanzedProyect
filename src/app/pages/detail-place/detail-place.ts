import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { PlacesService } from '../../services/places-service';
import { FavoriteService } from '../../services/favorite-service';
import { AccommodationDetailDTO, CommentDTO } from '../../models/place-dto';
import { CommonModule } from '@angular/common';
import { BookingForm } from '../../components/booking-form/booking-form';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-detail-place',
  imports: [CommonModule, BookingForm],
  templateUrl: './detail-place.html',
  styleUrl: './detail-place.css'
})
export class DetailPlace implements OnInit {

  placeId: string = "";
  place: AccommodationDetailDTO | undefined;
  comments: CommentDTO[] = [];
  currentPage: number = 0;
  totalPages: number = 0;
  currentImageIndex = 0;

  constructor(
    private route: ActivatedRoute,
    private placesService: PlacesService,
    private favoriteService: FavoriteService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.route.params.subscribe((params) => {
      this.placeId = params["id"];
      this.loadPlaceDetail(this.placeId);
      this.loadComments(this.placeId, this.currentPage);
    });
  }

  private loadPlaceDetail(placeId: string): void {
    this.placesService.getDetail(placeId).subscribe({
      next: (place) => {
        this.place = place;
      },
      error: (error) => {
        console.error('Error al cargar detalle del alojamiento:', error);
        Swal.fire("Error", "No se pudo cargar el detalle del alojamiento.", "error");
      }
    });
  }

  private loadComments(accommodationId: string, page: number): void {
    this.placesService.getComments(accommodationId, page).subscribe({
      next: (response) => {
        console.log('Comentarios cargados del backend:', response);
        console.log('Primer comentario (si existe):', response.comments?.[0]);
        this.comments = response.comments;
        this.totalPages = response.totalPages;
      },
      error: (error) => {
        console.error('Error al cargar comentarios:', error);
        this.comments = [];
        this.totalPages = 1;
      }
    });
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


  public changePage(page: number): void {
    if (page >= 0 && page < this.totalPages) {
      this.currentPage = page;
      this.loadComments(this.placeId, this.currentPage);
    }
  }

  public getVisiblePages(): number[] {
    const pages: number[] = [];
    const maxVisiblePages = 5; // Mostrar máximo 5 números de página

    if (this.totalPages <= maxVisiblePages) {
      // Si hay pocas páginas, mostrar todas
      for (let i = 0; i < this.totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Si hay muchas páginas, mostrar un rango alrededor de la página actual
      let start = Math.max(0, this.currentPage - Math.floor(maxVisiblePages / 2));
      let end = Math.min(this.totalPages - 1, start + maxVisiblePages - 1);

      // Ajustar el inicio si estamos cerca del final
      if (end - start + 1 < maxVisiblePages) {
        start = Math.max(0, end - maxVisiblePages + 1);
      }

      for (let i = start; i <= end; i++) {
        pages.push(i);
      }
    }

    return pages;
  }

  // Método para volver a la lista
  goBack(): void {
    this.router.navigate(['/']);
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

  public addToFavorites(): void {
    if (!this.placeId) return;

    Swal.fire({
      title: "¿Agregar a favoritos?",
      text: "Este alojamiento se añadirá a tu lista de favoritos.",
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Sí, agregar",
      cancelButtonText: "Cancelar",
    }).then((result) => {
      if (result.isConfirmed) {
        this.favoriteService.addToFavorites(this.placeId).subscribe({
          next: () => {
            Swal.fire("¡Agregado!", "El alojamiento ha sido añadido a tus favoritos.", "success");
          },
          error: (err: any) => {
            console.error('Error adding to favorites:', err);
            Swal.fire("Error", "No se pudo agregar a favoritos.", "error");
          }
        });
      }
    });
  }
}