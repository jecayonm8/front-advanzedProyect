import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';

@Component({
  selector: 'app-update-profile',
  imports: [ReactiveFormsModule],
  templateUrl: './update-profile.html',
  styleUrl: './update-profile.css',
})
export class UpdateProfile implements OnInit {

  updateProfileForm!: FormGroup;

  constructor(private formBuilder: FormBuilder) {
    this.createForm();
  }

  ngOnInit() {
    // TODO: Load current user data and patch the form
    this.loadUserData();
  }

  private createForm() {
    this.updateProfileForm = this.formBuilder.group({
      name: ['', [Validators.required, Validators.maxLength(100)]],
      phone: ['', [Validators.maxLength(10)]],
      photoUrl: [''],
      birthDate: ['', [Validators.required]]
    });
  }

  private loadUserData() {
    // TODO: Implement service call to get current user data
    // For now, we'll simulate loading data
    const mockUserData = {
      name: 'Juan Pérez',
      phone: '1234567890',
      photoUrl: 'https://example.com/photo.jpg',
      birthDate: '1990-01-01'
    };

    this.updateProfileForm.patchValue(mockUserData);
  }

  public updateProfile() {
    if (this.updateProfileForm.invalid) {
      this.updateProfileForm.markAllAsTouched();
      return;
    }

    console.log('Updating profile:', this.updateProfileForm.value);
    // TODO: Implement service call to update user profile
  }

  public onFileChange(event: Event) {
    const input = event.target as HTMLInputElement;

    if (input.files && input.files.length > 0) {
      const file = input.files[0];
      this.updateProfileForm.patchValue({ photoUrl: file });
      this.updateProfileForm.get('photoUrl')?.updateValueAndValidity();
    } else {
      this.updateProfileForm.patchValue({ photoUrl: '' });
      this.updateProfileForm.get('photoUrl')?.updateValueAndValidity();
    }
  }

}
