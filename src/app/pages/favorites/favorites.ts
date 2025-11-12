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
        this.places = response.places;
        this.totalPages = response.totalPages;
        this.currentPage = page;
      },
      error: (err: any) => {
        console.error('Error loading favorites:', err);
        Swal.fire("Error", "No se pudieron cargar los favoritos.", "error");
      }
    });
  }

  public changePage(page: number): void {
    if (page >= 0 && page < this.totalPages) {
      this.loadFavorites(page);
    }
  }

  public getVisiblePages(): number[] {
    return [0, 1, 2, 3, 4]; // Mostrar siempre 5 números de página
  }

  public trackByPage(index: number, item: number): number {
    return item;
  }

  public trackById(index: number, item: AccommodationDTO): string {
    return item.id;
  }
}