
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';

@Component({
  selector: 'app-create-booking',
  imports: [ReactiveFormsModule],
  templateUrl: './create-booking.html',
  styleUrl: './create-booking.css'
})
export class CreateBooking {

    bookingStates: string[];

    bookingForm!: FormGroup;

  constructor(private formBuilder: FormBuilder) {
    this.createForm();
    this.bookingStates = ['PENDING', 'CANCELLED', 'COMPLETED'];
  }

  private createForm() {
    this.bookingForm = this.formBuilder.group({
      checkIn: ['', [Validators.required]],
      checkOut: ['', [Validators.required]],
      guest_number: [1, [Validators.required, Validators.min(1)]],
      bookingState: ['', [Validators.required]],
      accommodationCode: ['', [Validators.required]],
      user: ['', [Validators.required]],
      paymentMethod: ['', [Validators.required]],
      totalPrice: ['', [Validators.required, Validators.pattern(/^[0-9]+(\.[0-9]{1,2})?$/)]],
      message: ['', []]
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

    return checkIn > checkOut ? null : { invalidDateRange: true };
  }

  public createBooking() {
    if (this.bookingForm.invalid) {
      this.bookingForm.markAllAsTouched();
      return;
    }

    console.log(this.bookingForm.value);
  }
}