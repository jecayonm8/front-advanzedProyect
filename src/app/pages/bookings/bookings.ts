import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { BookingDTO, SearchBookingDTO } from '../../models/booking-dto';
import { BookingService } from '../../services/booking-service';
import { TokenService } from '../../services/token-service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-bookings',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './bookings.html',
  styleUrl: './bookings.css',
})
export class Bookings {

  bookings: BookingDTO[] = [];
  filterForm!: FormGroup;
  currentPage = 0;
  totalPages = 0;
  bookingStates: string[] = ['PENDING', 'CANCELED', 'COMPLETED'];

  constructor(
    private bookingService: BookingService,
    private tokenService: TokenService,
    private formBuilder: FormBuilder
  ) {
    this.createFilterForm();
    this.loadBookings();
  }

  private createFilterForm() {
    this.filterForm = this.formBuilder.group({
      state: [''],
      checkIn: [''],
      checkOut: [''],
      guest_number: ['']
    }, { validators: this.validateDateRange });
  }

  private validateDateRange(form: FormGroup) {
    const start = form.get('checkIn')?.value;
    const end = form.get('checkOut')?.value;

    if ((start && !end) || (!start && end)) {
      return { dateRangeIncomplete: true };
    }

    if (start && end) {
      const checkIn = new Date(start);
      const checkOut = new Date(end);
      if (checkIn >= checkOut) {
        return { invalidDateRange: true };
      }
    }

    return null;
  }

  public applyFilters() {
    if (this.filterForm.valid) {
      this.currentPage = 0;
      this.loadBookings();
    }
  }

  public clearFilters() {
    this.filterForm.reset();
    this.currentPage = 0;
    this.loadBookings();
  }

  public changePage(page: number): void {
    if (page >= 0 && page < this.totalPages) {
      this.currentPage = page;
      this.loadBookings();
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

  private loadBookings() {
    const filters: SearchBookingDTO = this.filterForm.value;
    this.bookingService.getUserBookingsWithFilters(this.currentPage, filters).subscribe({
      next: (data) => {
        console.log('Raw data from backend:', data);
        console.log('Type of data:', typeof data);
        console.log('Is array?', Array.isArray(data));
        this.bookings = Array.isArray(data) ? data : [];
        // Para paginación, asumimos que si hay resultados, hay más páginas
        // En una implementación real, el backend debería devolver totalPages
        this.totalPages = this.bookings.length > 0 ? Math.max(this.currentPage + 5, 10) : 1;
      },
      error: (err) => {
        console.error('Error loading bookings:', err);
        this.bookings = []; // Asegurar que siempre sea un array
        this.totalPages = 1;
      }
    });
  }

  trackByFn(index: number, item: any): any {
    return index;
  }

  public cancelBooking(booking: BookingDTO) {
    if (!booking.id) {
      Swal.fire("Error", "No se puede cancelar esta reserva: ID no disponible.", "error");
      return;
    }
    Swal.fire({
      title: "¿Estás seguro?",
      text: "Esta acción cancelará la reserva y no se puede deshacer.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Sí, cancelar reserva",
      cancelButtonText: "No, mantener reserva"
    }).then((result) => {
      if (result.isConfirmed) {
        this.bookingService.deleteBooking(booking.id).subscribe({
          next: () => {
            Swal.fire("Cancelada!", "La reserva ha sido cancelada correctamente.", "success");
            this.loadBookings(); // Reload the list
          },
          error: (err) => {
            console.error('Error canceling booking:', err);
            Swal.fire("Error", "No se pudo cancelar la reserva. Inténtalo de nuevo.", "error");
          }
        });
      }
    });
  }

}
