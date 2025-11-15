import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { map } from 'rxjs/operators';
import { BookingDTO, CreateBookingDTO, SearchBookingDTO } from '../models/booking-dto';

/**
 * Servicio que maneja todas las operaciones relacionadas con reservas de alojamientos.
 * Se encarga de crear reservas, consultar reservas de usuarios y alojamientos,
 * y gestionar el ciclo de vida de las reservas.
 */
@Injectable({
  providedIn: 'root'
})
export class BookingService {
  private apiUrl = 'http://localhost:8080/api/bookings';

  constructor(private http: HttpClient) {}

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
      console.log('No token found in localStorage');
    }

    return new HttpHeaders(headers);
  }

  /**
   * Crea una nueva reserva para un alojamiento específico.
   * @param booking Datos de la reserva a crear
   * @returns Observable con mensaje de confirmación
   */
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

  /**
   * Obtiene todas las reservas del usuario autenticado.
   * @param userId ID del usuario (no usado directamente, se obtiene del token)
   * @returns Observable con lista de reservas
   */
  public getUserBookings(userId: string): Observable<BookingDTO[]> {
    return this.getUserBookingsWithFilters(0, {});
  }

  /**
   * Obtiene las reservas del usuario autenticado con filtros y paginación.
   * @param page Número de página
   * @param filters Filtros de búsqueda
   * @returns Observable con lista de reservas filtradas
   */
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

  public getBookingById(bookingId: string): Observable<BookingDTO> {
    const headers = this.getAuthHeaders();
    return this.http.get<{error: boolean, message: BookingDTO}>(`${this.apiUrl}/${bookingId}`, { headers }).pipe(
      map(response => response.message)
    );
  }

  public deleteBooking(bookingId: string): Observable<any> {
    const headers = this.getAuthHeaders();
    return this.http.delete(`${this.apiUrl}/${bookingId}`, { headers });
  }

}