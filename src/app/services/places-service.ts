import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { AccommodationDTO, CreateAccommodationDTO } from '../models/place-dto';

@Injectable({
  providedIn: 'root'
})
export class PlacesService {
  private apiUrl = 'http://localhost:8080/api/accommodations'; // Ajusta la URL de tu backend

  constructor(private http: HttpClient) {}

  public getAll(): Observable<AccommodationDTO[]> {
    // Para desarrollo, usa datos de prueba si el backend no está disponible
    // return this.http.get<AccommodationDTO[]>(this.apiUrl);
    return of(this.createTestPlaces());
  }

  public save(newPlace: CreateAccommodationDTO): Observable<any> {
    return this.http.post(this.apiUrl, newPlace);
  }

  public delete(placeId: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${placeId}`);
  }

  private createTestPlaces(): AccommodationDTO[] {
    return [
      {
        id: '1',
        title: 'Casa de Campo El Roble',
        price: 250000,
        photo_url: 'https://example.com/images/campo1.jpg',
        average_rating: 4.8,
        city: 'Manizales',
        latitude: 5.0703,
        longitude: -75.5138
      },
      {
        id: '2',
        title: 'Apartamento Moderno en el Centro',
        price: 180000,
        photo_url: 'https://example.com/images/apto1.jpg',
        average_rating: 4.5,
        city: 'Bogotá',
        latitude: 4.6486,
        longitude: -74.0635
      },
      {
        id: '3',
        title: 'Cabaña en el Lago Azul',
        price: 300000,
        photo_url: 'https://example.com/images/lago1.jpg',
        average_rating: 4.9,
        city: 'Guatapé',
        latitude: 6.2333,
        longitude: -75.1667
      }
    ];
  }
}
