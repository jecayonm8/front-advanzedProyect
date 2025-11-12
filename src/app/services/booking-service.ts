import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { BookingDTO, CreateBookingDTO } from '../models/booking-dto';

@Injectable({
  providedIn: 'root'
})
export class BookingService {
  private apiUrl = 'http://localhost:8080/api/bookings';
  private bookings: BookingDTO[] = [];

  constructor(private http: HttpClient) {
    // Inicializar con datos de prueba para desarrollo
    this.bookings = this.createTestBookings();
  }

  private getAuthHeaders(): HttpHeaders {
    const token = sessionStorage.getItem('AuthToken');
    console.log('Token from sessionStorage:', token);

    const headers = {
      'Content-Type': 'application/json'
    } as any;

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
      console.log('Authorization header:', `Bearer ${token}`);
    } else {
      console.log('No token found in sessionStorage');
    }

    return new HttpHeaders(headers);
  }

  public create(idAccommodation: string, booking: { checkIn: string; checkOut: string; guest_number: number }): Observable<string> {
    const headers = this.getAuthHeaders();
    console.log('Booking request headers:', headers);
    console.log('Booking request body:', booking);
    console.log('Booking URL:', `${this.apiUrl}/${idAccommodation}`);

    return this.http.post<string>(`${this.apiUrl}/${idAccommodation}`, booking, {
      headers: headers
    });
  }

  public getUserBookings(userId: string): Observable<BookingDTO[]> {
    // Por ahora devolver datos locales, después activar HTTP:
    // return this.http.get<BookingDTO[]>(`${this.apiUrl}/user/${userId}`, {
    //   headers: this.getAuthHeaders()
    // });
    return of(this.bookings.filter(b => b.userId === userId));
  }

  private createTestBookings(): BookingDTO[] {
    return [
      {
        id: '1',
        checkIn: '2025-12-01',
        checkOut: '2025-12-05',
        guest_number: 2,
        accommodationCode: 'ACC001',
        status: 'CONFIRMED',
        userId: '1',
        accommodationTitle: 'Casa de Campo El Roble'
      },
      {
        id: '2',
        checkIn: '2025-11-15',
        checkOut: '2025-11-18',
        guest_number: 1,
        accommodationCode: 'ACC002',
        status: 'PENDING',
        userId: '1',
        accommodationTitle: 'Apartamento Moderno en el Centro'
      }
    ];
  }
}