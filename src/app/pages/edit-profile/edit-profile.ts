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
    console.log('EditProfile ngOnInit called');
    // Set email from token immediately
    this.userEmail = this.tokenService.getEmail() || '';
    console.log('Initial userEmail from token:', this.userEmail);
    this.loadUserData();
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

  private loadUserData() {
    const token = this.tokenService.getToken();
    if (!token) {
      alert('No se encontró token de autenticación');
      return;
    }

    console.log('Token found:', token);
    const userId = this.tokenService.getUserId();
    console.log('User ID from token:', userId);

    if (!userId) {
      console.error('No user ID found in token');
      alert('No se pudo obtener el ID del usuario');
      return;
    }

    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });

    console.log('Making GET request to:', `http://localhost:8080/api/users/${userId}`);
    console.log('Headers:', headers);

    this.http.get(`http://localhost:8080/api/users/${userId}`, { headers })
      .subscribe({
        next: (response: any) => {
          console.log('Response received from API:', response);
          // Extract user data from response
          const userData = response.message;
          console.log('User data extracted:', userData);

          this.userEmail = userData.email;
          console.log('Updated userEmail:', this.userEmail);
          // Populate form with editable fields
          const formData = {
            name: userData.name,
            phone: userData.phone || '',
            photoUrl: userData.photoUrl || '',
            birthDate: userData.birthDate ? userData.birthDate.split('T')[0] : '' // Format date for input
          };
          console.log('Form data to patch:', formData);
          this.editProfileForm.patchValue(formData);
          console.log('Form value after patch:', this.editProfileForm.value);
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

          if (error.status === 401) {
            alert('Sesión expirada. Por favor, inicia sesión nuevamente.');
            return;
          }

          // No hay datos de respaldo - mostrar error
          console.error('Error al cargar datos del usuario');
          alert('Error al cargar datos del perfil. Inténtalo de nuevo.');
        }
      });
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

    const userId = this.tokenService.getUserId();
    if (!userId) {
      alert('No se pudo obtener el ID del usuario');
      return;
    }

    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });

    const profileData = this.editProfileForm.value;

    console.log('Datos del formulario a enviar:', profileData);

    this.http.put(`http://localhost:8080/api/users/me`, profileData, { headers })
      .subscribe({
        next: (response) => {
          console.log('Perfil actualizado exitosamente:', response);
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