
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';

@Component({
  selector: 'app-create-review',
  imports: [ReactiveFormsModule],
  templateUrl: './create-review.html',
  styleUrl: './create-review.css'
})
export class CreateReview {

  reviewForm!: FormGroup;

  constructor(private formBuilder: FormBuilder) {
    this.createForm();
  }

  private createForm() {
    this.reviewForm = this.formBuilder.group({
      title: ['', [Validators.required, Validators.maxLength(100)]],
      message: ['', [Validators.required, Validators.minLength(20)]],
      rating: [null, [Validators.required, Validators.min(1), Validators.max(5)]],
      accommodationCode: ['', [Validators.required]],
      reservationCode: ['', [Validators.required]],
      authorId: ['', [Validators.required]]
    });
  }

  public createReview() {
    if (this.reviewForm.invalid) {
      this.reviewForm.markAllAsTouched();
      return;
    }

    console.log(this.reviewForm.value);
  }
}