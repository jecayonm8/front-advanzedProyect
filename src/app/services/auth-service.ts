import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { LoginDTO } from '../models/login-dto';
import { CreateUserDTO } from '../models/register-dto';
import { ResponseDTO } from '../models/response-dto';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  

  private authURL = "http://localhost:8080/api/auth";

  constructor(private http: HttpClient) { }

  public login(loginDTO: LoginDTO): Observable<ResponseDTO> {
  return this.http.post<ResponseDTO>(`${this.authURL}/login`, loginDTO);
  }

  public register(createUserDTO: CreateUserDTO): Observable<ResponseDTO> {
    return this.http.post<ResponseDTO>(`${this.authURL}/register`, createUserDTO);
  }
}
  



