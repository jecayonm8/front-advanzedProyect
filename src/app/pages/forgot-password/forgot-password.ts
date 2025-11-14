import { Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-forgot-password',
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './forgot-password.html',
  styleUrl: './forgot-password.css',
})
export class ForgotPassword {

  step: number = 1; // 1: email, 2: code, 3: password
  loading: boolean = false;
  errorMessage: string = '';

  emailForm!: FormGroup;
  resetForm!: FormGroup;

  constructor(
    private formBuilder: FormBuilder,
    private http: HttpClient,
    private router: Router
  ) {
    this.createForms();
  }

  private createForms() {
    this.emailForm = this.formBuilder.group({
      email: ['', [Validators.required, Validators.email]]
    });

    this.resetForm = this.formBuilder.group({
      code: ['', [Validators.required]],
      newPassword: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  private passwordMatchValidator(form: FormGroup) {
    const password = form.get('password');
    const confirmPassword = form.get('confirmPassword');
    if (password && confirmPassword && password.value !== confirmPassword.value) {
      confirmPassword.setErrors({ mismatch: true });
      return { mismatch: true };
    }
    return null;
  }

  sendResetCode() {
    if (this.emailForm.invalid) {
      this.emailForm.markAllAsTouched();
      return;
    }

    this.loading = true;
    this.errorMessage = '';

    const email = this.emailForm.value.email;

    this.http.post(`http://localhost:8080/api/auth/forgot-password`, { email })
      .subscribe({
        next: (response: any) => {
          this.loading = false;
          Swal.fire({
            title: 'Código enviado',
            text: 'Se ha enviado un código de verificación a tu email',
            icon: 'success',
            timer: 2000,
            showConfirmButton: false
          });
          this.step = 2;
        },
        error: (error) => {
          this.loading = false;
          this.errorMessage = error.error?.message || 'Error al enviar el código';
          Swal.fire({
            title: 'Error',
            text: this.errorMessage,
            icon: 'error',
            confirmButtonText: 'Aceptar'
          });
        }
      });
  }

  resendCode() {
    this.sendResetCode(); // Reutilizar la lógica de envío
  }

  resetPassword() {
    if (this.resetForm.invalid) {
      this.resetForm.markAllAsTouched();
      return;
    }

    this.loading = true;
    this.errorMessage = '';

    const email = this.emailForm.value.email;
    const code = this.resetForm.value.code;
    const newPassword = this.resetForm.value.newPassword;

    this.http.post(`http://localhost:8080/api/auth/reset-password`, { email, code, newPassword })
      .subscribe({
        next: (response: any) => {
          this.loading = false;
          Swal.fire({
            title: 'Contraseña cambiada',
            text: 'Tu contraseña ha sido cambiada exitosamente',
            icon: 'success',
            timer: 2000,
            showConfirmButton: false
          });
          this.router.navigate(['/login']);
        },
        error: (error) => {
          this.loading = false;
          this.errorMessage = error.error?.message || 'Error al cambiar la contraseña';
          Swal.fire({
            title: 'Error',
            text: this.errorMessage,
            icon: 'error',
            confirmButtonText: 'Aceptar'
          });
        }
      });
  }

  goBack() {
    if (this.step > 1) {
      this.step--;
      this.errorMessage = '';
    }
  }
}
