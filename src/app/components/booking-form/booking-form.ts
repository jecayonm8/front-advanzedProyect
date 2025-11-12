import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { BookingService } from '../../services/booking-service';
import { CreateBookingDTO } from '../../models/booking-dto';

@Component({
  selector: 'app-booking-form',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './booking-form.html',
  styleUrls: ['./booking-form.css']
})
export class BookingForm implements OnInit {
  @Input() accommodationId!: string;

  bookingForm!: FormGroup;
  isLoading = false;
  successMessage = '';
  errorMessage = '';

  constructor(
    private formBuilder: FormBuilder,
    private bookingService: BookingService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.createForm();
    this.setDefaultTimes();
  }

  private createForm(): void {
    this.bookingForm = this.formBuilder.group({
      checkIn: ['', [Validators.required]],
      checkOut: ['', [Validators.required]],
      guestNumber: [1, [Validators.required, Validators.min(1)]]
    }, { validators: this.dateRangeValidator });
  }

  private dateRangeValidator(group: FormGroup): { [key: string]: any } | null {
    const checkIn = group.get('checkIn')?.value;
    const checkOut = group.get('checkOut')?.value;
    if (checkIn && checkOut && new Date(checkIn) >= new Date(checkOut)) {
      return { dateRangeInvalid: true };
    }
    return null;
  }

  private setDefaultTimes(): void {
    // Establecer horas por defecto: check-in 1 PM, check-out 12 PM
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);

    // Check-in: hoy a la 1 PM
    const checkInDateTime = new Date(today);
    checkInDateTime.setHours(13, 0, 0, 0); // 13:00 = 1 PM

    // Check-out: mañana a las 12 PM
    const checkOutDateTime = new Date(tomorrow);
    checkOutDateTime.setHours(12, 0, 0, 0); // 12:00 = 12 PM

    // Formatear como YYYY-MM-DDTHH:mm (formato datetime-local)
    const checkInFormatted = checkInDateTime.toISOString().slice(0, 16);
    const checkOutFormatted = checkOutDateTime.toISOString().slice(0, 16);

    this.bookingForm.patchValue({
      checkIn: checkInFormatted,
      checkOut: checkOutFormatted
    });
  }

  onSubmit(): void {
    if (this.bookingForm.invalid) {
      this.bookingForm.markAllAsTouched();
      return;
    }

    this.isLoading = true;
    this.successMessage = '';
    this.errorMessage = '';

    const formValue = this.bookingForm.value;
    const checkInDate = new Date(formValue.checkIn);
    const checkOutDate = new Date(formValue.checkOut);

    // Check-in: 13:00 (1 PM) del día seleccionado por el usuario
    const checkInDateTime = new Date(checkInDate);
    checkInDateTime.setHours(13, 0, 0, 0);

    // Check-out: 12:00 (12 PM) del día seleccionado por el usuario
    const checkOutDateTime = new Date(checkOutDate);
    checkOutDateTime.setHours(12, 0, 0, 0);

    const bookingData: CreateBookingDTO = {
      checkIn: this.formatDate(checkInDateTime),
      checkOut: this.formatDate(checkOutDateTime),
      guest_number: formValue.guestNumber,
      accommodationCode: this.accommodationId
    };

    console.log('Original checkIn date from form:', formValue.checkIn);
    console.log('Original checkOut date from form:', formValue.checkOut);
    console.log('Check-in DateTime object:', checkInDateTime);
    console.log('Check-out DateTime object:', checkOutDateTime);
    console.log('Sending booking data:', bookingData);
    console.log('Accommodation ID:', this.accommodationId);

    this.bookingService.create(bookingData).subscribe({
      next: (response) => {
        this.isLoading = false;
        this.successMessage = 'Reserva finalizada exitosamente';
      },
      error: (error) => {
        this.isLoading = false;
        console.error('Error creating booking:', error);
        console.error('Error details:', {
          status: error.status,
          statusText: error.statusText,
          url: error.url,
          error: error.error,
          message: error.message
        });
        console.error('Full error response:', error);
        this.errorMessage = error?.error?.message || error?.error?.error || error?.message || 'Error al crear la reserva. Intente nuevamente.';
      }
    });
  }

  getMinCheckOut(): string {
    const checkIn = this.bookingForm.get('checkIn')?.value;
    return checkIn ? checkIn : '';
  }

  private formatDate(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');
    return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}`;
  }
}