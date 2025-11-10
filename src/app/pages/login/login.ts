import { Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../services/auth-service';
import { TokenService } from '../../services/token-service';
import { Router } from '@angular/router';
import { LoginDTO } from '../../models/login-dto';
import Swal from 'sweetalert2';


@Component({
  selector: 'app-login',
  imports: [ReactiveFormsModule],
  templateUrl: './login.html',
  styleUrl: './login.css'
})
export class Login {
  loginForm!: FormGroup;

  constructor(private formBuilder: FormBuilder, private authService: AuthService, private tokenService: TokenService
    , private router: Router
  ) {
    this.createForm();
  }

  private createForm() {
    this.loginForm = this.formBuilder.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(7), Validators.maxLength(20)]]
    });
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
