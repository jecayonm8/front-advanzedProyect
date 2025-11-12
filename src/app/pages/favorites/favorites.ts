import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, Router } from '@angular/router';
import { AccommodationDTO } from '../../models/place-dto';
import { FavoriteService } from '../../services/favorite-service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-favorites',
  imports: [CommonModule, RouterLink],
  templateUrl: './favorites.html',
  styleUrl: './favorites.css',
})
export class Favorites {

  places: AccommodationDTO[] = [];
  currentPage: number = 0;
  totalPages: number = 0;

  constructor(private favoriteService: FavoriteService, private router: Router) {
    this.loadFavorites();
  }

  private loadFavorites(page: number = 0): void {
    this.favoriteService.getFavorites(page).subscribe({
      next: (response) => {
        this.places = response.places || [];
        // Calcular totalPages dinámicamente como en bookings
        this.totalPages = this.places.length > 0 ? Math.max(page + 5, 10) : 1;
        this.currentPage = page;
      },
      error: (err: any) => {
        console.error('Error loading favorites:', err);
        this.places = [];
        this.totalPages = 1;
        this.currentPage = 0;
      }
    });
  }

  public changePage(page: number): void {
    if (page >= 0 && page < this.totalPages) {
      this.loadFavorites(page);
    }
  }

  public getVisiblePages(): number[] {
    return Array.from({ length: Math.min(5, this.totalPages) }, (_, i) => i);
  }

  public trackByPage(index: number, item: number): number {
    return item;
  }

  public trackById(index: number, item: AccommodationDTO): string {
    return item.id;
  }

  onDelete(placeId: string): void {
    Swal.fire({
      title: "¿Estás seguro?",
      text: "Esta acción eliminará el alojamiento de tus favoritos.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Confirmar",
      cancelButtonText: "Cancelar",
    }).then((result) => {
      if (result.isConfirmed) {
        this.favoriteService.removeFromFavorites(placeId).subscribe({
          next: () => {
            Swal.fire("Eliminado!", "El alojamiento ha sido eliminado de tus favoritos.", "success");
            // Recargar la página actual después de eliminar
            this.loadFavorites(this.currentPage);
          },
          error: (err: any) => {
            console.error('Error removing from favorites:', err);
            Swal.fire("Error", "No se pudo eliminar de favoritos.", "error");
          }
        });
      }
    });
  }


}