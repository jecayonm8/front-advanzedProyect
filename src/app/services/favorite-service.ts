import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { AccommodationDTO } from '../models/place-dto';

@Injectable({
  providedIn: 'root'
})
export class FavoriteService {
  private apiUrl = 'https://advanzedproyect-production.up.railway.app/api/favorites';

  constructor(private http: HttpClient) {}

  private getAuthHeaders(): HttpHeaders {
    const token = sessionStorage.getItem('AuthToken');
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': token ? `Bearer ${token}` : ''
    });
  }

  /**
   * Agrega un alojamiento a favoritos
   * @param id ID del alojamiento
   * @returns Observable con respuesta del servidor
   */
  public addToFavorites(id: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/${id}`, {}, {
      headers: this.getAuthHeaders()
    }).pipe(
      map((response: any) => response.message || response)
    );
  }

  /**
   * Elimina un alojamiento de favoritos
   * @param id ID del alojamiento
   * @returns Observable con respuesta del servidor
   */
  public removeFromFavorites(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`, {
      headers: this.getAuthHeaders()
    }).pipe(
      map((response: any) => response.message || response)
    );
  }

  /**
   * Obtiene la lista de alojamientos favoritos con paginación
   * @param page Número de página (0-based)
   * @returns Observable con lista de favoritos y total de páginas
   */
  public getFavorites(page: number = 0): Observable<{places: AccommodationDTO[], totalPages: number}> {
    return this.http.get<any>(`${this.apiUrl}/${page}`, {
      headers: this.getAuthHeaders()
    }).pipe(
      map((response: any) => {
        return {
          places: response.message || [],
          totalPages: response.totalPages || 1
        };
      })
    );
  }
}