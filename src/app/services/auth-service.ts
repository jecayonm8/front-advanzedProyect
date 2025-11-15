import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { LoginDTO } from '../models/login-dto';
import { CreateUserDTO } from '../models/register-dto';
import { ResponseDTO } from '../models/response-dto';

/**
 * Servicio que maneja la autenticación de usuarios.
 * Se encarga de procesar el login, registro y gestión de tokens de autenticación.
 */
@Injectable({
  providedIn: 'root'
})
export class AuthService {
  

  private authURL = "http://localhost:8080/api/auth";

  constructor(private http: HttpClient) { }

  /**
   * Realiza el login de un usuario con email y contraseña.
   * @param loginDTO Credenciales de login
   * @returns Observable con respuesta de autenticación
   */
  public login(loginDTO: LoginDTO): Observable<ResponseDTO> {
  return this.http.post<ResponseDTO>(`${this.authURL}/login`, loginDTO);
  }

  /**
   * Registra un nuevo usuario en el sistema.
   * @param createUserDTO Datos del usuario a registrar
   * @returns Observable con respuesta de registro
   */
  public register(createUserDTO: CreateUserDTO): Observable<ResponseDTO> {
    return this.http.post<ResponseDTO>(this.authURL, createUserDTO);
  }
}
  



