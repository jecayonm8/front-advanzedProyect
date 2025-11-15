import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, Router } from '@angular/router';
import { AccommodationDTO, AccommodationType, SearchFiltersDTO } from '../../models/place-dto';
import { PlacesService } from '../../services/places-service';
import Swal from 'sweetalert2';


@Component({
  selector: 'app-my-places',
  imports: [CommonModule, RouterLink],
  templateUrl: './my-places.html',
  styleUrl: './my-places.css',
})
export class MyPlaces {

  places: AccommodationDTO[] = [];
  currentPage: number = 0;
  totalPages: number = 0;

  constructor(private placesService: PlacesService, private router: Router) {
    this.loadPlaces();
  }

  private loadPlaces(page: number = 0): void {
    this.placesService.getHostAccommodations(page).subscribe({
      next: (response) => {
        this.places = response.places;
        this.totalPages = 10; // Simular 10 páginas para mostrar paginación completa
        this.currentPage = page;
      },
      error: (err: any) => {
        console.error('Error loading host accommodations:', err);
        // Fallback a datos locales si falla
        this.places = [];
        this.totalPages = 0;
      }
    });
  }

  public changePage(page: number): void {
    if (page >= 0 && page < this.totalPages) {
      this.loadPlaces(page);
    }
  }

  public getVisiblePages(): number[] {
    return Array.from({ length: Math.min(5, this.totalPages) }, (_, i) => i);
  }

  public trackByPage(index: number, item: number): number {
    return item;
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
        this.placesService.deleteAccommodation(placeId).subscribe({
          next: () => {
            Swal.fire("Eliminado!", "El alojamiento ha sido eliminado correctamente.", "success");
            // Recargar la página actual después de eliminar
            this.loadPlaces(this.currentPage);
          },
          error: (err: any) => {
            console.error('Error deleting accommodation:', err);
            Swal.fire("Error", "No se pudo eliminar el alojamiento.", "error");
          }
        });
      }
    });
  }

}
