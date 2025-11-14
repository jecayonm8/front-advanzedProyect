import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { map } from 'rxjs/operators';
import { BookingDTO, CreateBookingDTO, SearchBookingDTO } from '../models/booking-dto';

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
    const token = localStorage.getItem('AuthToken');
    console.log('Token from localStorage:', token);

    const headers = {
      'Content-Type': 'application/json'
    } as any;

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
      console.log('Authorization header:', `Bearer ${token}`);
    } else {
      console.log('No token found in localStorage');
    }

    return new HttpHeaders(headers);
  }

  public create(booking: CreateBookingDTO): Observable<string> {
    const headers = this.getAuthHeaders();
    console.log('Booking request headers:', headers);
    console.log('Booking request body:', booking);
    console.log('Booking URL:', `${this.apiUrl}/${booking.accommodationCode}`);

    return this.http.post<string>(`${this.apiUrl}/${booking.accommodationCode}`, {
      checkIn: booking.checkIn,
      checkOut: booking.checkOut,
      guest_number: booking.guest_number
    }, {
      headers: headers
    });
  }

  public getUserBookings(userId: string): Observable<BookingDTO[]> {
    return this.getUserBookingsWithFilters(0, {});
  }

  public getUserBookingsWithFilters(page: number, filters: SearchBookingDTO): Observable<BookingDTO[]> {
    const headers = this.getAuthHeaders();
    const body = {
      state: filters.state || null,
      checkIn: filters.checkIn || null,
      checkOut: filters.checkOut || null,
      guest_number: filters.guest_number || null
    };

    return this.http.post<{error: boolean, message: BookingDTO[]}>(`http://localhost:8080/api/users/me/bookings/${page}`, body, {
      headers: headers
    }).pipe(
      map(response => response.message || [])
    );
  }

  public getAccommodationBookingsWithFilters(accommodationId: string, page: number, filters: SearchBookingDTO): Observable<BookingDTO[]> {
    const headers = this.getAuthHeaders();
    const body = {
      state: filters.state || null,
      checkIn: filters.checkIn || null,
      checkOut: filters.checkOut || null,
      guest_number: filters.guest_number || null
    };

    return this.http.post<{error: boolean, message: BookingDTO[]}>(`http://localhost:8080/api/accommodations/${accommodationId}/bookings/${page}`, body, {
      headers: headers
    }).pipe(
      map(response => response.message || [])
    );
  }

  public deleteBooking(bookingId: string): Observable<any> {
    const headers = this.getAuthHeaders();
    return this.http.delete(`${this.apiUrl}/${bookingId}`, { headers });
  }

  private createTestBookings(): BookingDTO[] {
    return [
      {
        id: '1',
        bookingState: 'PENDING',
        checkIn: '2025-12-01',
        checkOut: '2025-12-05',
        guest_number: 2,
        user: { id: '1', name: 'Juan Pérez', email: 'juan@example.com' }
      },
      {
        id: '2',
        bookingState: 'COMPLETED',
        checkIn: '2025-11-15',
        checkOut: '2025-11-18',
        guest_number: 1,
        user: { id: '1', name: 'Juan Pérez', email: 'juan@example.com' }
      }
    ];
  }
}