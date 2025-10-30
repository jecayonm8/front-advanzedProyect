import { Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';

@Component({
  selector: 'app-create-complaint',
  imports: [ReactiveFormsModule],
  templateUrl: './create-complaint.html',
  styleUrl: './create-complaint.css'
})
export class CreateComplaint {

  complaintForm!: FormGroup;

  complaintTypes: string[];

  constructor(private formBuilder: FormBuilder) {
    this.complaintTypes = ['PETITION', 'COMPLAINT', 'CLAIM', 'SUGGESTION'];
    this.createForm();
  }

  private createForm() {
    this.complaintForm = this.formBuilder.group({
      reason: ['', [Validators.required, Validators.maxLength(120)]],
      description: ['', [Validators.required, Validators.minLength(20)]],
      reservationCode: ['', [Validators.required]],
      customerId: ['', [Validators.required]],
      complaintType: ['', [Validators.required]]
    });
  }

  public createComplaint() {
    if (this.complaintForm.invalid) {
      this.complaintForm.markAllAsTouched();
      return;
    }

    console.log(this.complaintForm.value);
  }
}