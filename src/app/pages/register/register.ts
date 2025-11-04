import { Component } from '@angular/core';
import { AbstractControlOptions, FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';

@Component({
  selector: 'app-register',
  imports: [ReactiveFormsModule],
  templateUrl: './register.html',
  styleUrl: './register.css'
})
export class Register {

  cities: string[];
  registerForm!: FormGroup;
  
  constructor(private formBuilder: FormBuilder) {
    this.createForm();
    this.cities = ['Bogotá', 'Medellín', 'Cali', 'Armenia', 'Barranquilla', 'Cartagena'];
  }

  private createForm() {
    this.registerForm = this.formBuilder.group({
      name: ['', [Validators.required]],
      phone: ['', [Validators.required, Validators.maxLength(10)]],
      photoUrl: [null],
      city: ['', [Validators.required]],
      dateBirth: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.maxLength(10), Validators.minLength(7)]],
      repeatPassword: ['', [Validators.required, Validators.maxLength(10), Validators.minLength(7)]]

    }, { validators: this.passwordsMatchValidator } as AbstractControlOptions);
  }
  
  public passwordsMatchValidator(formGroup: FormGroup) {
    const password = formGroup.get('password')?.value;
    const confirmaPassword = formGroup.get('repeatPassword')?.value;
    // Si las contraseñas no coinciden, devuelve un error, de lo contrario, null
    return password == confirmaPassword ? null : { passwordsMismatch: true };
  }

  public createUser() {
    console.log(this.registerForm.value);
  }

  public onFileChange(event: Event) {
    const input = event.target as HTMLInputElement;

    if (input.files && input.files.length > 0) {
      const file = input.files[0];
      this.registerForm.patchValue({ photoUrl: file });
      this.registerForm.get('photoUrl')?.updateValueAndValidity();
    } else {
      this.registerForm.patchValue({ photoUrl: null });
      this.registerForm.get('photoUrl')?.updateValueAndValidity();
    }
  }

}
