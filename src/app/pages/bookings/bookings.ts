import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { BookingDTO, SearchBookingDTO } from '../../models/booking-dto';
import { BookingService } from '../../services/booking-service';
import { TokenService } from '../../services/token-service';

@Component({
  selector: 'app-bookings',
  imports: [CommonModule, RouterLink, ReactiveFormsModule],
  templateUrl: './bookings.html',
  styleUrl: './bookings.css',
})
export class Bookings {

  bookings: BookingDTO[] = [];
  filterForm!: FormGroup;
  currentPage = 0;
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

  public nextPage() {
    this.currentPage++;
    this.loadBookings();
  }

  public prevPage() {
    if (this.currentPage > 0) {
      this.currentPage--;
      this.loadBookings();
    }
  }

  private loadBookings() {
    const filters: SearchBookingDTO = this.filterForm.value;
    this.bookingService.getUserBookingsWithFilters(this.currentPage, filters).subscribe({
      next: (data) => this.bookings = data,
      error: (err) => console.error('Error loading bookings:', err)
    });
  }

}
