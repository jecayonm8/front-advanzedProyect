import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { TokenService } from '../../services/token-service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-update-profile',
  imports: [ReactiveFormsModule],
  templateUrl: './update-profile.html',
  styleUrl: './update-profile.css',
})
export class UpdateProfile implements OnInit {

  updateProfileForm!: FormGroup;
  userEmail: string = '';

  constructor(private formBuilder: FormBuilder, private http: HttpClient, private tokenService: TokenService) {
    this.createForm();
  }

  ngOnInit() {
    console.log('UpdateProfile component initialized');
    // Set email from token immediately
    this.userEmail = this.tokenService.getEmail() || '';
    console.log('Initial userEmail from token:', this.userEmail);
    this.loadUserData();
  }

  private createForm() {
    this.updateProfileForm = this.formBuilder.group({
      name: ['', [Validators.required, Validators.maxLength(100)]],
      phone: ['', [Validators.maxLength(10)]],
      photoUrl: ['', [Validators.maxLength(300)]],
      birthDate: ['', [Validators.required, this.pastDateValidator]]
    });
  }

  private pastDateValidator(control: any) {
    if (!control.value) return null;
    const today = new Date();
    const birthDate = new Date(control.value);
    return birthDate < today ? null : { pastDate: true };
  }

  private loadUserData() {
    const token = this.tokenService.getToken();
    if (!token) {
      Swal.fire({
        title: "Error",
        text: "No se encontró token de autenticación",
        icon: "error",
        confirmButtonText: "Aceptar"
      });
      return;
    }

    console.log('Token found:', token);
    console.log('User ID from token:', this.tokenService.getUserId());
    console.log('User role from token:', this.tokenService.getRole());

    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });

    this.http.get(`http://localhost:8080/api/users/me`, { headers })
      .subscribe({
        next: (response: any) => {
          console.log('Response received from API:', response);
          const userData = response; // Assuming backend returns user data directly
          console.log('User data extracted:', userData);
          this.userEmail = userData.email || this.userEmail;
          console.log('Updated userEmail:', this.userEmail);
          // Populate form with editable fields
          const formData = {
            name: userData.name,
            phone: userData.phone || '',
            photoUrl: userData.photoUrl || '',
            birthDate: userData.birthDate ? userData.birthDate.split('T')[0] : '' // Format date for input
          };
          console.log('Form data to patch:', formData);
          this.updateProfileForm.patchValue(formData);
          console.log('Form value after patch:', this.updateProfileForm.value);
          // Store in localStorage for future use
          localStorage.setItem('userProfile', JSON.stringify({
            name: userData.name,
            phone: userData.phone,
            photoUrl: userData.photoUrl,
            birthDate: userData.birthDate ? userData.birthDate.split('T')[0] : ''
          }));
          console.log('User data stored in localStorage');
        },
        error: (error) => {
          console.error('Error fetching user data:', error);
          console.error('Status:', error.status);
          console.error('StatusText:', error.statusText);
          console.error('Error body:', error.error);

          if (error.status === 0) {
            console.warn('Backend server may not be running. Using local data.');
          } else if (error.status === 401) {
            Swal.fire({
              title: "Sesión expirada",
              text: "Por favor, inicia sesión nuevamente.",
              icon: "error",
              confirmButtonText: "Aceptar"
            });
            return;
          } else if (error.status === 404) {
            console.warn('Endpoint not found. Using local data.');
          } else {
            Swal.fire({
              title: "Error",
              text: "Error al cargar los datos del usuario: " + (error.error?.message || error.message),
              icon: "error",
              confirmButtonText: "Aceptar"
            });
          }
          // Fallback to localStorage or token data
          this.loadFromLocalStorage();
        }
      });
  }

  private loadFromLocalStorage() {
    console.log('Loading user data from localStorage or token');
    // Always try to load from localStorage first
    const storedProfile = localStorage.getItem('userProfile');
    let userData;

    if (storedProfile) {
      userData = JSON.parse(storedProfile);
      console.log('Data loaded from localStorage:', userData);
    } else {
      // If no stored data, use data from token or mock data
      const tokenName = this.tokenService.getName();
      const tokenEmail = this.tokenService.getEmail();
      console.log('Token name:', tokenName, 'Token email:', tokenEmail);
      userData = {
        name: tokenName || 'Usuario',
        phone: '',
        photoUrl: '',
        birthDate: ''
      };
      console.log('Using token data for form:', userData);
      // Store token data for future use
      localStorage.setItem('userProfile', JSON.stringify(userData));
    }

    // Populate form with data
    console.log('Patching form with data:', userData);
    this.updateProfileForm.patchValue(userData);
    console.log('Form value after localStorage patch:', this.updateProfileForm.value);
    this.userEmail = this.tokenService.getEmail() || 'usuario@example.com';
    console.log('Updated userEmail from token:', this.userEmail);
  }

  public updateProfile() {
    if (this.updateProfileForm.invalid) {
      this.updateProfileForm.markAllAsTouched();
      return;
    }

    const token = this.tokenService.getToken();
    if (!token) {
      Swal.fire({
        title: "Error",
        text: "No se encontró token de autenticación",
        icon: "error",
        confirmButtonText: "Aceptar"
      });
      return;
    }

    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });

    const profileData = this.updateProfileForm.value;

    this.http.put(`http://localhost:8080/api/users/me`, profileData, { headers })
      .subscribe({
        next: (response) => {
          Swal.fire({
            title: "¡Éxito!",
            text: "Perfil actualizado exitosamente",
            icon: "success",
            timer: 2000,
            showConfirmButton: false
          });
          this.updateUserState(profileData);
        },
        error: (error) => {
          console.error('Error updating profile:', error);
          Swal.fire({
            title: "Error",
            text: "Error al actualizar el perfil: " + (error.error?.message || 'Error desconocido'),
            icon: "error",
            confirmButtonText: "Aceptar"
          });
        }
      });
  }

  private updateUserState(profileData: any) {
    // Store updated user data in localStorage or service
    localStorage.setItem('userProfile', JSON.stringify(profileData));
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
