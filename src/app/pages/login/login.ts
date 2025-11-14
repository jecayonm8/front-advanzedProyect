import { Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../../services/auth-service';
import { TokenService } from '../../services/token-service';
import { Router } from '@angular/router';
import { LoginDTO } from '../../models/login-dto';
import Swal from 'sweetalert2';
import { CommonModule } from '@angular/common';


@Component({
  selector: 'app-login',
  imports: [ReactiveFormsModule, RouterLink, CommonModule],
  templateUrl: './login.html',
  styleUrl: './login.css'
})
export class Login {
  loginForm!: FormGroup;

  // Forgot Password Modal
  forgotStep: number = 1;
  forgotLoading: boolean = false;
  forgotErrorMessage: string = '';
  forgotEmailForm!: FormGroup;
  forgotResetForm!: FormGroup;

  constructor(private formBuilder: FormBuilder, private authService: AuthService, private tokenService: TokenService
    , private router: Router, private http: HttpClient
  ) {
    this.createForm();
    this.createForgotForms();
  }

  private createForm() {
    this.loginForm = this.formBuilder.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(7), Validators.maxLength(20)]]
    });
  }

  private createForgotForms() {
    this.forgotEmailForm = this.formBuilder.group({
      email: ['', [Validators.required, Validators.email]]
    });

    this.forgotResetForm = this.formBuilder.group({
      code: ['', [Validators.required]],
      newPassword: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  showForgotPasswordModal() {
    this.forgotStep = 1;
    this.forgotErrorMessage = '';
    // Usar Bootstrap modal
    const modal = document.getElementById('forgotPasswordModal');
    if (modal) {
      const bsModal = new (window as any).bootstrap.Modal(modal);
      bsModal.show();
    }
  }

  sendResetCode() {
    if (this.forgotEmailForm.invalid) {
      this.forgotEmailForm.markAllAsTouched();
      return;
    }

    this.forgotLoading = true;
    this.forgotErrorMessage = '';

    const email = this.forgotEmailForm.value.email;

    this.http.post(`http://localhost:8080/api/auth/forgot-password`, { email })
      .subscribe({
        next: (response: any) => {
          console.log('Forgot password response:', response);
          this.forgotLoading = false;
          Swal.fire({
            title: 'Código enviado',
            text: 'Se ha enviado un código de verificación a tu email',
            icon: 'success',
            timer: 2000,
            showConfirmButton: false
          });
          this.forgotStep = 2;
        },
        error: (error) => {
          this.forgotLoading = false;
          console.warn('Error response from forgot-password API:', error);
          // Even with error, proceed to next step as code might have been sent
          this.forgotStep = 2;
          this.forgotErrorMessage = ''; // Clear any previous error
        }
      });
  }

  resendCode() {
    this.sendResetCode();
  }

  resetPassword() {
    if (this.forgotResetForm.invalid) {
      this.forgotResetForm.markAllAsTouched();
      return;
    }

    this.forgotLoading = true;
    this.forgotErrorMessage = '';

    const email = this.forgotEmailForm.value.email;
    const code = this.forgotResetForm.value.code;
    const newPassword = this.forgotResetForm.value.newPassword;

    const payload = { code, email, newPassword };
    console.log('Sending reset password request:', payload);

    this.http.post(`http://localhost:8080/api/auth/password-recovery`, payload)
      .subscribe({
        next: (response: any) => {
          console.log('Reset password success:', response);
          this.forgotLoading = false;
          Swal.fire({
            title: 'Contraseña cambiada',
            text: 'Tu contraseña ha sido cambiada exitosamente',
            icon: 'success',
            timer: 2000,
            showConfirmButton: false
          });
          // Cerrar modal
          const modal = document.getElementById('forgotPasswordModal');
          if (modal) {
            const bsModal = (window as any).bootstrap.Modal.getInstance(modal);
            bsModal.hide();
          }
        },
        error: (error) => {
          console.error('Reset password error:', error);
          this.forgotLoading = false;
          this.forgotErrorMessage = error.error?.message || 'Error al cambiar la contraseña';
          Swal.fire({
            title: 'Error',
            text: this.forgotErrorMessage,
            icon: 'error',
            confirmButtonText: 'Aceptar'
          });
        }
      });
  }

  forgotGoBack() {
    if (this.forgotStep > 1) {
      this.forgotStep--;
      this.forgotErrorMessage = '';
    }
  }

  public login() {
  // Obtenemos los datos del formulario y los convertimos a LoginDTO
  const loginDTO = this.loginForm.value as LoginDTO;

  this.authService.login(loginDTO).subscribe({
    next: (data) => {
      this.tokenService.login(data.message.token); // Guardamos el token usando el servicio de token
      this.router.navigate(['/']).then(() => window.location.reload()); // Redireccionamos al inicio y recargamos la página
    },
    error: (error) => {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: error.error.content // Mostramos el mensaje de error del backend
      });
    }
  });
}

}
