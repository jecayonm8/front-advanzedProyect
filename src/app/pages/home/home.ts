import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { PlacesService } from '../../services/places-service';
import { FavoriteService } from '../../services/favorite-service';
import { MapService } from '../../services/map-service';
import { AccommodationDTO, SearchFiltersDTO, Amenities } from '../../models/place-dto';
import { MarkerDTO } from '../../models/marker-dto';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-home',
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './home.html',
  styleUrls: ['./home.css']
})
export class Home implements OnInit {
  searchForm!: FormGroup;
  places: AccommodationDTO[] = [];
  amenitiesOptions: { label: string; value: string }[] = [];
  currentPage = 0;
  totalPages = 0;
  isLoading = false;
  noResults = false;

  constructor(
    private formBuilder: FormBuilder,
    private placesService: PlacesService,
    private favoriteService: FavoriteService,
    private mapService: MapService
  ) {
    this.createSearchForm();
    this.initializeAmenities();
  }

  ngOnInit(): void {
    this.loadAmenities();
    this.performSearch(0);
  }

  private createSearchForm(): void {
    this.searchForm = this.formBuilder.group({
      city: [''],
      checkIn: [''],
      checkOut: [''],
      guestNumber: ['', [Validators.min(1)]],
      minPrice: ['', [Validators.min(0)]],
      maxPrice: ['', [Validators.min(0)]],
      amenities: [[]]
    });
  }

  private initializeAmenities(): void {
    this.amenitiesOptions = [
      { label: 'Wifi', value: 'WIFI' },
      { label: 'Parqueadero', value: 'PARKING_AND_FACILITIES' },
      { label: 'Aire acondicionado', value: 'SERVICES' },
      { label: 'Lavanderia', value: 'BEDROOM_AND_LAUNDRY' },
      { label: 'Apto para mascotas', value: 'SERVICE_ANIMALS_ALLOWED' },
      { label: 'Congelador', value: 'FREEZER' },
      { label: 'Agua caliente', value: 'HOT_WATER' },
      { label: 'Cocina', value: 'KITCHEN' },
      { label: 'TV', value: 'ENTERTAINMENT' }
    ];
  }

  private loadAmenities(): void {
    this.placesService.getAmenities().subscribe({
      next: (amenities) => {
        // Usar amenities del backend si están disponibles
        if (amenities && amenities.length > 0) {
          this.amenitiesOptions = amenities.map(amenity => ({
            label: amenity,
            value: amenity
          }));
        }
      },
      error: () => {
        // Mantener las opciones por defecto
      }
    });
  }

  public performSearch(page: number = 0): void {
    if (this.isLoading) return;

    this.isLoading = true;
    this.currentPage = page;
    const filters = this.buildSearchFilters();

    this.placesService.searchWithBody(filters, page).subscribe({
      next: (results) => {
        this.places = results;
        this.noResults = results.length === 0;
        this.isLoading = false;

        // Para paginación, asumimos que si hay resultados, hay más páginas
        // En una implementación real, el backend debería devolver totalPages
        this.totalPages = results.length > 0 ? Math.max(this.currentPage + 5, 10) : 1;

        // Actualizar mapa con resultados
        this.updateMap();
      },
      error: (error) => {
        console.error('Error en búsqueda:', error);
        this.isLoading = false;
        this.noResults = true;
      }
    });
  }


  private buildSearchFilters(): SearchFiltersDTO {
    const formValue = this.searchForm.value;

    // Validar fechas: si una está presente, la otra también debe estarlo
    let checkIn: string | null = null;
    let checkOut: string | null = null;
    if (formValue.checkIn || formValue.checkOut) {
      if (formValue.checkIn && formValue.checkOut) {
        checkIn = formValue.checkIn;
        checkOut = formValue.checkOut;
      } else {
        // Reset fechas si no están completas
        this.searchForm.patchValue({ checkIn: '', checkOut: '' });
      }
    }

    // Validar precios: si uno está presente, el otro también debe estarlo
    let minimum: number | null = null;
    let maximum: number | null = null;
    if (formValue.minPrice || formValue.maxPrice) {
      if (formValue.minPrice && formValue.maxPrice) {
        minimum = formValue.minPrice;
        maximum = formValue.maxPrice;
      } else {
        // Reset precios si no están completos
        this.searchForm.patchValue({ minPrice: '', maxPrice: '' });
      }
    }

    return {
      city: formValue.city || null,
      checkIn,
      checkOut,
      guest_number: formValue.guestNumber || null,
      minimum,
      maximum,
      list: formValue.amenities && formValue.amenities.length > 0 ? formValue.amenities : null
    };
  }

  public changePage(page: number): void {
    if (page >= 0 && page < this.totalPages) {
      this.performSearch(page);
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

  public trackByPage(index: number, item: number): number {
    return item;
  }

  public resetSearch(): void {
    this.searchForm.reset();
    this.currentPage = 0;
    this.performSearch(0);
  }

  public onAmenityToggle(amenity: string, checked: boolean): void {
    const amenitiesControl = this.searchForm.get('amenities');
    if (!amenitiesControl) return;

    const currentAmenities: string[] = amenitiesControl.value || [];
    if (checked) {
      if (!currentAmenities.includes(amenity)) {
        amenitiesControl.setValue([...currentAmenities, amenity]);
      }
    } else {
      amenitiesControl.setValue(currentAmenities.filter(item => item !== amenity));
    }
    amenitiesControl.updateValueAndValidity();
  }

  private updateMap(): void {
    if (this.places.length > 0) {
      this.mapService.create('map');
      const markers = this.mapItemToMarker(this.places);
      this.mapService.drawMarkers(markers);
    }
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

  trackById(_: number, item: AccommodationDTO) {
    return item.id;
  }

  public addToFavorites(id: string): void {
    Swal.fire({
      title: "¿Agregar a favoritos?",
      text: "Este alojamiento se añadirá a tu lista de favoritos.",
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Sí, agregar",
      cancelButtonText: "Cancelar",
    }).then((result) => {
      if (result.isConfirmed) {
        this.favoriteService.addToFavorites(id).subscribe({
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
