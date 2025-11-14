import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { TokenService } from '../../services/token-service';

@Component({
  selector: 'app-edit-profile',
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './edit-profile.html',
  styleUrl: './edit-profile.css',
})
export class EditProfile implements OnInit {

  editProfileForm!: FormGroup;
  userEmail: string = '';

  constructor(private formBuilder: FormBuilder, private http: HttpClient, private tokenService: TokenService) {
    this.createForm();
  }

  ngOnInit() {
    // Cargar datos desde el token y localStorage, sin llamar al backend por ahora
    this.loadUserDataFromToken();
  }

  private createForm() {
    this.editProfileForm = this.formBuilder.group({
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

  private loadUserDataFromToken() {
    const token = this.tokenService.getToken();
    if (!token) {
      alert('No se encontró token de autenticación');
      this.loadFromLocalStorage();
      return;
    }

    console.log('Token found:', token);
    console.log('User ID from token:', this.tokenService.getUserId());
    console.log('User role from token:', this.tokenService.getRole());
    console.log('User name from token:', this.tokenService.getName());
    console.log('User email from token:', this.tokenService.getEmail());

    // Usar datos del token para email
    this.userEmail = this.tokenService.getEmail() || 'usuario@example.com';

    // Cargar datos adicionales desde localStorage o usar valores por defecto
    this.loadFromLocalStorage();
  }
  private loadFromLocalStorage() {
    // Always try to load from localStorage first
    const storedProfile = localStorage.getItem('userProfile');
    let userData;

    if (storedProfile) {
      userData = JSON.parse(storedProfile);
    } else {
      // If no stored data, create mock data
      userData = {
        name: 'Juan Pérez',
        phone: '1234567890',
        photoUrl: 'https://example.com/photo.jpg',
        birthDate: '1990-01-01'
      };
      // Store mock data for future use
      localStorage.setItem('userProfile', JSON.stringify(userData));
    }

    // Populate form with data
    this.editProfileForm.patchValue(userData);
    this.userEmail = 'usuario@example.com'; // Mock email for display
  }

  public editProfile() {
    if (this.editProfileForm.invalid) {
      this.editProfileForm.markAllAsTouched();
      return;
    }

    const token = this.tokenService.getToken();
    if (!token) {
      alert('No se encontró token de autenticación');
      return;
    }

    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });

    const profileData = this.editProfileForm.value;

    this.http.put(`http://localhost:8080/api/users/me`, profileData, { headers })
      .subscribe({
        next: (response) => {
          alert('Perfil actualizado exitosamente');
          this.updateUserState(profileData);
        },
        error: (error) => {
          console.error('Error updating profile:', error);
          alert('Error al actualizar el perfil: ' + (error.error?.message || 'Error desconocido'));
        }
      });
  }

  private updateUserState(profileData: any) {
    // Store updated user data in localStorage or service
    localStorage.setItem('userProfile', JSON.stringify(profileData));
  }


}