
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import Swal from 'sweetalert2';
import { BookingService } from '../../services/booking-service';
import { TokenService } from '../../services/token-service';

@Component({
  selector: 'app-create-booking',
  imports: [ReactiveFormsModule],
  templateUrl: './create-booking.html',
  styleUrl: './create-booking.css'
})
export class CreateBooking implements OnInit {

    bookingForm!: FormGroup;

  constructor(
    private formBuilder: FormBuilder,
    private bookingService: BookingService,
    private tokenService: TokenService,
    private route: ActivatedRoute
  ) {
    this.createForm();
  }

  ngOnInit(): void {
    this.route.params.subscribe((params) => {
      const accommodationId = params['id'];
      if (accommodationId) {
        this.bookingForm.patchValue({
          accommodationCode: accommodationId
        });
      }
    });
  }

  private createForm() {
    this.bookingForm = this.formBuilder.group({
      checkIn: ['', [Validators.required]],
      checkOut: ['', [Validators.required]],
      guest_number: [1, [Validators.required, Validators.min(1)]],
      accommodationCode: ['', [Validators.required]]
    }, { validators: this.validateDateRange });
  }

  private validateDateRange(form: FormGroup) {
    const start = form.get('checkIn')?.value;
    const end = form.get('checkOut')?.value;

    if (!start || !end) {
      return null;
    }

    const checkIn = new Date(start);
    const checkOut = new Date(end);

    return checkIn < checkOut ? null : { invalidDateRange: true };
  }

  public createBooking() {
    if (this.bookingForm.invalid) {
      this.bookingForm.markAllAsTouched();
      Swal.fire("Error", "Por favor complete todos los campos requeridos.", "error");
      return;
    }

    this.bookingService.create(this.bookingForm.value).subscribe({
      next: (response) => {
        Swal.fire("¡Éxito!", response, "success");
        this.bookingForm.reset();
      },
      error: (error) => {
        Swal.fire("Error", "No se pudo crear la reserva.", "error");
      }
    });
  }
}