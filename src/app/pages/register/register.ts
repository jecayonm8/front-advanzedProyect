import { Component } from '@angular/core';
import { AbstractControlOptions, FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';

@Component({
  selector: 'app-register',
  imports: [ReactiveFormsModule],
  templateUrl: './register.html',
  styleUrl: './register.css'
})
export class Register {

  registerForm!: FormGroup;
  
  constructor(private formBuilder: FormBuilder) {
    this.createForm();
  }

  private createForm() {
  this.registerForm = this.formBuilder.group({
    name: ['', [Validators.required]],
    phone: ['', [Validators.required, Validators.maxLength(10)]],
    photoUrl: [''],
    dateBirth: ['', [Validators.required]],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.maxLength(10), Validators.minLength(7)]],
    repeatPassword: ['', [Validators.required, Validators.maxLength(10), Validators.minLength(7)]]

  }, {validators: this.passwordsMatchValidator } as AbstractControlOptions);
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

}
