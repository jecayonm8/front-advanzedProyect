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
    this.fetchUserData();
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

  private fetchUserData() {
  const token = this.tokenService.getToken();
  if (!token) {
    alert('No se encontró token de autenticación');
    return;
  }

  console.log('Token found:', token);
  console.log('User ID from token:', this.tokenService.getUserId());
  console.log('User role from token:', this.tokenService.getRole());

  const headers = new HttpHeaders({
    'Authorization': `Bearer ${token}`
  });

  this.http.get<any>(`http://localhost:8080/api/users/me`, { headers })
    .subscribe({
      next: (response: any) => {
        // ⭐ ESTOS LOGS SON CRÍTICOS - MÍRALOS EN LA CONSOLA
        console.log('==========================================');
        console.log('✅ RESPUESTA COMPLETA:', response);
        console.log('📦 Tipo:', typeof response);
        console.log('📦 Es null?:', response === null);
        console.log('📦 Es undefined?:', response === undefined);
        console.log('📦 Keys:', response ? Object.keys(response) : 'No hay keys');
        console.log('📦 response.data existe?:', response?.data !== undefined);
        console.log('📦 response.data:', response?.data);
        console.log('==========================================');
        
        // ⭐ DETENER AQUÍ SI NO HAY DATOS
        if (!response) {
          console.error('❌ Response es null o undefined');
          this.loadFromLocalStorage();
          return;
        }
        
        if (!response.message) {
          console.error('❌ response.data no existe');
          console.error('💡 Probablemente el backend no tiene el endpoint GET /me');
          console.error('💡 O el endpoint retorna algo diferente');
          this.loadFromLocalStorage();
          return;
        }
        
        const userData = response.message;
        console.log('👤 userData:', userData);
        
        this.userEmail = userData.email;
        
        this.editProfileForm.patchValue({
          name: userData.name,
          phone: userData.phone || '',
          photoUrl: userData.photoUrl || '',
          birthDate: userData.birthDate ? userData.birthDate.split('T')[0] : ''
        });
        
        localStorage.setItem('userProfile', JSON.stringify({
          name: userData.name,
          phone: userData.phone,
          photoUrl: userData.photoUrl,
          birthDate: userData.birthDate ? userData.birthDate.split('T')[0] : ''
        }));
        
        console.log('✅ Perfil cargado correctamente');
      },
      error: (error) => {
        console.error('==========================================');
        console.error('❌ ERROR EN LA PETICIÓN');
        console.error('Status:', error.status);
        console.error('StatusText:', error.statusText);
        console.error('Error completo:', error);
        console.error('Error body:', error.error);
        console.error('==========================================');

        if (error.status === 0) {
          alert('⚠️ El servidor backend no está respondiendo. Verifica que esté corriendo en localhost:8080');
        } else if (error.status === 401) {
          alert('Sesión expirada. Por favor, inicia sesión nuevamente.');
        } else if (error.status === 404) {
          alert('❌ El endpoint GET /api/users/me NO EXISTE en el backend.\n\nPor favor, agrega este método al UserController:\n\n@GetMapping("/me")\npublic ResponseEntity<ResponseDTO<UserDTO>> getCurrentUser() throws Exception {\n    String id = currentUserService.getCurrentUser();\n    UserDTO userDTO = userService.get(id);\n    return ResponseEntity.ok(new ResponseDTO<>(false, userDTO));\n}');
        } else {
          alert('Error: ' + (error.error?.message || error.message));
        }
        
        this.loadFromLocalStorage();
      }
    });
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

    // ⭐ LOGS PARA DEBUG: Verificar qué datos se están enviando
    console.log('==========================================');
    console.log('📤 DATOS DEL FORMULARIO A ENVIAR:');
    console.log('Nombre:', profileData.name);
    console.log('Teléfono:', profileData.phone);
    console.log('Photo URL:', profileData.photoUrl);
    console.log('Fecha nacimiento:', profileData.birthDate);
    console.log('Datos completos:', profileData);
    console.log('==========================================');

    this.http.put(`http://localhost:8080/api/users/me`, profileData, { headers })
      .subscribe({
        next: (response) => {
          // ⭐ LOGS PARA DEBUG: Verificar respuesta del backend
          console.log('==========================================');
          console.log('✅ PERFIL ACTUALIZADO EXITOSAMENTE');
          console.log('Respuesta del backend:', response);
          console.log('==========================================');

          alert('Perfil actualizado exitosamente');
          this.updateUserState(profileData);
        },
        error: (error) => {
          // ⭐ LOGS PARA DEBUG: Verificar error en actualización
          console.log('==========================================');
          console.log('❌ ERROR AL ACTUALIZAR PERFIL');
          console.log('Status:', error.status);
          console.log('Error completo:', error);
          console.log('Error body:', error.error);
          console.log('==========================================');

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