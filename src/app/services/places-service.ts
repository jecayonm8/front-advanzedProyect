import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { AccommodationDTO, CreateAccommodationDTO } from '../models/place-dto';

@Injectable({
  providedIn: 'root'
})
export class PlacesService {
  private apiUrl = 'http://localhost:8080/api/accommodations';
  private places: AccommodationDTO[] = [];

  constructor(private http: HttpClient) {
    // Inicializar con datos de prueba para desarrollo
    this.places = this.createTestPlaces();
  }

  private getAuthHeaders(): HttpHeaders {
    const token = localStorage.getItem('authToken');
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': token ? `Bearer ${token}` : ''
    });
  }

  public getAll(): Observable<AccommodationDTO[]> {
    // Por ahora devolver datos locales, pero en producción usar:
    // return this.http.get<AccommodationDTO[]>(`${this.apiUrl}/1`, {
    //   headers: this.getAuthHeaders(),
    //   params: { page: '0' }
    // });
    return of(this.places);
  }

  public getAllSync(): AccommodationDTO[] {
    return this.places;
  }

  public save(newPlace: CreateAccommodationDTO): Observable<string> {
    return this.http.post<string>(this.apiUrl, newPlace, {
      headers: this.getAuthHeaders()
    });
  }

  public update(id: string, updatedPlace: Partial<AccommodationDTO>): Observable<string> {
    // Por ahora usar actualización local, después activar HTTP:
    // return this.http.put<string>(`${this.apiUrl}/${id}`, updatedPlace, {
    //   headers: this.getAuthHeaders()
    // });

    // Actualización local para desarrollo
    const index = this.places.findIndex(place => place.id === id);
    if (index !== -1) {
      this.places[index] = { ...this.places[index], ...updatedPlace };
    }
    return of('Alojamiento actualizado exitosamente');
  }

  public delete(id: string): Observable<string> {
    // Por ahora usar eliminación local, después activar HTTP:
    // return this.http.delete<string>(`${this.apiUrl}/${id}`, {
    //   headers: this.getAuthHeaders()
    // });

    // Eliminación local para desarrollo
    this.places = this.places.filter(place => place.id !== id);
    return of('Alojamiento eliminado exitosamente');
  }

  private createTestPlaces(): AccommodationDTO[] {
    return [
      {
        id: '1',
        title: 'Casa de Campo El Roble',
        price: 250000,
        photo_url: 'https://example.com/images/campo1.jpg',
        average_rating: 4.8,
        city: 'Manizales'
      },
      {
        id: '2',
        title: 'Apartamento Moderno en el Centro',
        price: 180000,
        photo_url: 'https://example.com/images/apto1.jpg',
        average_rating: 4.5,
        city: 'Bogotá'
      },
      {
        id: '3',
        title: 'Cabaña en el Lago Azul',
        price: 300000,
        photo_url: 'https://example.com/images/lago1.jpg',
        average_rating: 4.9,
        city: 'Guatapé'
      }
    ];
  }
}
