import { Component } from '@angular/core';
import { AbstractControlOptions, FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth-service';
import { ImageService } from '../../services/image-service';
import { CreateUserDTO, UserRole } from '../../models/register-dto';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-register',
  imports: [ReactiveFormsModule],
  templateUrl: './register.html',
  styleUrl: './register.css'
})
export class Register {

  cities: string[];
  registerForm!: FormGroup;
  userRoles: { value: UserRole; label: string }[] = [
    { value: 'USER', label: 'Usuario - Solo puedo reservar alojamientos' },
    { value: 'HOST', label: 'Anfitrión - Puedo publicar y gestionar alojamientos' }
  ];

  uploadedImageUrl: string | null = null; // URL de la imagen subida a Cloudinary

  constructor(
    private formBuilder: FormBuilder,
    private authService: AuthService,
    private imageService: ImageService,
    private router: Router
  ) {
    this.createForm();
    this.cities = ['Bogotá', 'Medellín', 'Cali', 'Armenia', 'Barranquilla', 'Cartagena'];
  }

  private createForm() {
    this.registerForm = this.formBuilder.group({
      name: ['', [Validators.required]],
      surname: ['', [Validators.required]],
      phone: ['', [Validators.required, Validators.maxLength(10)]],
      country: ['colombia', [Validators.required]], // Valor por defecto
      birthDate: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      repeatPassword: ['', [Validators.required, Validators.minLength(6)]],
      role: ['USER', [Validators.required]] // Valor por defecto USER

    }, { validators: this.passwordsMatchValidator } as AbstractControlOptions);
  }
  
  public passwordsMatchValidator(formGroup: FormGroup) {
    const password = formGroup.get('password')?.value;
    const confirmaPassword = formGroup.get('repeatPassword')?.value;

    console.log('Validando contraseñas:', { password: password?.length, confirmaPassword: confirmaPassword?.length });

    // Si las contraseñas no coinciden, devuelve un error, de lo contrario, null
    const match = password === confirmaPassword;
    console.log('Contraseñas coinciden:', match);

    return match ? null : { passwordsMismatch: true };
  }

  public createUser() {
    console.log('Estado del formulario:', this.registerForm.valid);
    console.log('Errores del formulario:', this.registerForm.errors);
    console.log('Valores del formulario:', this.registerForm.value);

    // Verificar cada campo individualmente
    Object.keys(this.registerForm.controls).forEach(key => {
      const control = this.registerForm.get(key);
      console.log(`${key}: válido=${control?.valid}, errores=${JSON.stringify(control?.errors)}`);
    });

    if (this.registerForm.valid) {
      const formValue = this.registerForm.value;

      // Mostrar loading
      Swal.fire({
        title: 'Creando cuenta...',
        text: 'Por favor espera.',
        allowOutsideClick: false,
        showConfirmButton: false,
        willOpen: () => {
          Swal.showLoading();
        }
      });

      // Preparar los datos para el backend
      const userData: CreateUserDTO = {
        name: formValue.name,
        surname: formValue.surname,
        email: formValue.email,
        phone: formValue.phone,
        birthDate: formValue.birthDate,
        password: formValue.password,
        photoUrl: this.uploadedImageUrl || '', // Usar la URL subida a Cloudinary o cadena vacía
        country: formValue.country,
        role: formValue.role
      };

      console.log('Enviando datos de registro:', userData);

      this.authService.register(userData).subscribe({
        next: (response) => {
          Swal.close();
          console.log('Registro exitoso:', response);

          Swal.fire({
            title: '¡Registro exitoso!',
            text: this.uploadedImageUrl
              ? 'Tu cuenta ha sido creada y tu foto de perfil subida correctamente.'
              : 'Tu cuenta ha sido creada correctamente.',
            icon: 'success',
            confirmButtonText: 'Ir al inicio'
          }).then(() => {
            this.router.navigate(['/']);
          });
        },
        error: (error) => {
          Swal.close();
          console.error('Error en registro:', error);
          let errorMessage = 'Ocurrió un error al crear tu cuenta. Inténtalo de nuevo.';

          if (error.error && error.error.message) {
            errorMessage = error.error.message;
          }

          Swal.fire({
            title: 'Error en registro',
            text: errorMessage,
            icon: 'error',
            confirmButtonText: 'Intentar de nuevo'
          });
        }
      });
    } else {
      Swal.fire({
        title: 'Datos incompletos',
        text: 'Por favor completa todos los campos requeridos.',
        icon: 'warning',
        confirmButtonText: 'Entendido'
      });
    }
  }

  public onFileChange(event: Event) {
    const input = event.target as HTMLInputElement;

    if (input.files && input.files.length > 0) {
      const file = input.files[0];

      // Validar tamaño del archivo (5MB máximo)
      if (file.size > 5 * 1024 * 1024) {
        Swal.fire({
          title: 'Archivo demasiado grande',
          text: 'La imagen debe ser menor a 5MB.',
          icon: 'error',
          confirmButtonText: 'Entendido'
        });
        return;
      }

      // Validar tipo de archivo
      if (!file.type.startsWith('image/')) {
        Swal.fire({
          title: 'Tipo de archivo no válido',
          text: 'Solo se permiten archivos de imagen (JPG, PNG).',
          icon: 'error',
          confirmButtonText: 'Entendido'
        });
        return;
      }

      // Mostrar loading mientras se sube la imagen
      Swal.fire({
        title: 'Subiendo imagen...',
        text: 'Por favor espera.',
        allowOutsideClick: false,
        showConfirmButton: false,
        willOpen: () => {
          Swal.showLoading();
        }
      });

      // Subir imagen inmediatamente a Cloudinary
      this.imageService.uploadImage(file).subscribe({
        next: (response) => {
          Swal.close();
          console.log('Imagen subida exitosamente - Respuesta completa:', response);
          console.log('Tipo de respuesta:', typeof response);
          console.log('Keys de respuesta:', Object.keys(response));

          // Extraer la URL de la respuesta
          let imageUrl = null;

          // Intentar diferentes formatos de respuesta
          if (response.data?.url) {
            imageUrl = response.data.url;
            console.log('URL encontrada en response.data.url:', imageUrl);
          } else if (response.url) {
            imageUrl = response.url;
            console.log('URL encontrada en response.url:', imageUrl);
          } else if (response.secure_url) {
            imageUrl = response.secure_url;
            console.log('URL encontrada en response.secure_url:', imageUrl);
          } else if (response.data?.secure_url) {
            imageUrl = response.data.secure_url;
            console.log('URL encontrada en response.data.secure_url:', imageUrl);
          } else if (typeof response === 'string') {
            imageUrl = response;
            console.log('Respuesta es string directo:', imageUrl);
          } else if (response.message?.url) {
            imageUrl = response.message.url;
            console.log('URL encontrada en response.message.url:', imageUrl);
          } else if (response.message?.secure_url) {
            imageUrl = response.message.secure_url;
            console.log('URL encontrada en response.message.secure_url:', imageUrl);
          }

          if (imageUrl) {
            this.uploadedImageUrl = imageUrl;
            console.log('URL de imagen guardada:', imageUrl);

            Swal.fire({
              title: '¡Imagen subida!',
              text: 'Tu foto de perfil ha sido subida correctamente.',
              icon: 'success',
              timer: 1500,
              showConfirmButton: false
            });
          } else {
            console.error('No se pudo obtener la URL de la imagen. Respuesta completa:', response);
            console.error('Estructura de respuesta:', JSON.stringify(response, null, 2));
            Swal.fire({
              title: 'Error',
              text: 'No se pudo obtener la URL de la imagen subida. Revisa la consola para más detalles.',
              icon: 'error',
              confirmButtonText: 'Intentar de nuevo'
            });
          }
        },
        error: (error) => {
          Swal.close();
          console.error('Error al subir imagen:', error);
          let errorMessage = 'Ocurrió un error al subir tu foto de perfil.';

          if (error.status === 413) {
            errorMessage += ' La imagen es demasiado grande.';
          }

          Swal.fire({
            title: 'Error al subir imagen',
            text: errorMessage,
            icon: 'error',
            confirmButtonText: 'Intentar de nuevo'
          });
        }
      });
    } else {
      this.uploadedImageUrl = null;
    }
  }

}
