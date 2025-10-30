
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';

@Component({
  selector: 'app-create-reservation',
  imports: [ReactiveFormsModule],
  templateUrl: './create-reservation.html',
  styleUrl: './create-reservation.css'
})
export class CreateReservation {

  reservationForm!: FormGroup;

  constructor(private formBuilder: FormBuilder) {
    this.createForm();
  }

  private createForm() {
    this.reservationForm = this.formBuilder.group({
      startDate: ['', [Validators.required]],
      endDate: ['', [Validators.required]],
      numberGuests: [1, [Validators.required, Validators.min(1)]],
      accommodationCode: ['', [Validators.required]],
      customerId: ['', [Validators.required]],
      paymentMethod: ['', [Validators.required]],
      totalPrice: ['', [Validators.required, Validators.pattern(/^[0-9]+(\.[0-9]{1,2})?$/)]],
      message: ['', []]
    }, { validators: this.validateDateRange });
  }

  private validateDateRange(form: FormGroup) {
    const start = form.get('startDate')?.value;
    const end = form.get('endDate')?.value;

    if (!start || !end) {
      return null;
    }

    const startDate = new Date(start);
    const endDate = new Date(end);

    return endDate > startDate ? null : { invalidDateRange: true };
  }

  public createReservation() {
    if (this.reservationForm.invalid) {
      this.reservationForm.markAllAsTouched();
      return;
    }

    console.log(this.reservationForm.value);
  }
}