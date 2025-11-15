import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpRequest, HttpResponse, HttpParams } from '@angular/common/http';
import { Observable, of, map, filter } from 'rxjs';
import { AccommodationDTO, CreateAccommodationDTO, PlaceDTO, AccommodationDetailDTO, GetForUpdateDTO, UpdateAccommodationDTO, SearchFiltersDTO, CommentDTO, StatsDTO, StatsDateDTO } from '../models/place-dto';

/**
 * Servicio que maneja todas las operaciones relacionadas con alojamientos.
 * Se encarga de crear, actualizar, eliminar y buscar alojamientos, además de gestionar
 * comentarios, estadísticas y datos detallados de cada propiedad.
 */
@Injectable({
  providedIn: 'root'
})
export class PlacesService {
  private apiUrl = 'http://localhost:8080/api/accommodations';

  constructor(private http: HttpClient) {}

  private getAuthHeaders(): HttpHeaders {
    const token = sessionStorage.getItem('AuthToken');
    console.log('Token from sessionStorage in PlacesService:', token);

    const headers = {
      'Content-Type': 'application/json'
    } as any;

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
      console.log('Authorization header in PlacesService:', `Bearer ${token}`);
    } else {
      console.log('No token found in localStorage in PlacesService');
    }

    return new HttpHeaders(headers);
  }

  /**
   * Crea un nuevo alojamiento en el sistema.
   * @param newPlace Datos del alojamiento a crear
   * @returns Observable con el ID del alojamiento creado
   */
  public save(newPlace: CreateAccommodationDTO): Observable<string> {
    return this.http.post<string>(this.apiUrl, newPlace, {
      headers: this.getAuthHeaders()
    });
  }

  /**
   * Actualiza los datos de un alojamiento existente.
   * @param id ID del alojamiento a actualizar
   * @param updatedPlace Nuevos datos del alojamiento
   * @returns Observable con mensaje de confirmación
   */
  public update(id: string, updatedPlace: UpdateAccommodationDTO): Observable<string> {
    return this.http.put<string>(`${this.apiUrl}/${id}`, updatedPlace, {
      headers: this.getAuthHeaders()
    });
  }

  /**
   * Elimina un alojamiento del sistema.
   * @param id ID del alojamiento a eliminar
   * @returns Observable con mensaje de confirmación
   */
  public deleteAccommodation(id: string): Observable<string> {
    return this.http.delete<string>(`${this.apiUrl}/${id}`, {
      headers: this.getAuthHeaders()
    });
  }

  public get(id: number): Observable<AccommodationDTO> {
    return this.http.get<AccommodationDTO>(`${this.apiUrl}/${id}`, {
      headers: this.getAuthHeaders()
    });
  }

  public getAmenities(): Observable<string[]> {
    return this.http.get<any>(`${this.apiUrl}/amenities`).pipe(
      map((response: any) => {
        // El backend devuelve {error: false, message: [...]}
        // Extraemos el array del campo 'message'
        return response.message || [];
      })
    );
  }

  /**
   * Obtiene los detalles completos de un alojamiento específico.
   * @param id ID del alojamiento
   * @returns Observable con datos detallados del alojamiento
   */
  public getDetail(id: string): Observable<AccommodationDetailDTO> {
    return this.http.get<AccommodationDetailDTO>(`${this.apiUrl}/${id}/detail`).pipe(
      map((response: any) => {
        // El backend devuelve {error: false, message: {...}}
        const data = response.message || response;

        // Mapear campos del backend al DTO
        return {
          id: data.id,
          title: data.title,
          description: data.description,
          price: data.price,
          capacity: data.capacity,
          averageRating: data.averageRatings || data.averageRating || 0, // Backend usa "averageRatings"
          latitude: data.latitude,
          longitude: data.longitude,
          picsUrl: data.pics_url || data.picsUrl || [], // Backend usa "pics_url"
          amenities: data.amenities || [],
          userDetailDTO: data.userDetailDTO
        };
      })
    );
  }

  /**
   * Obtiene los comentarios de un alojamiento con paginación.
   * @param accommodationId ID del alojamiento
   * @param page Número de página (0-based)
   * @returns Observable con lista de comentarios y total de páginas
   */
  public getComments(accommodationId: string, page: number = 0): Observable<{comments: CommentDTO[], totalPages: number}> {
    return this.http.get<any>(`${this.apiUrl}/${accommodationId}/comments/${page}`).pipe(
      map((response: any) => {
        // El backend devuelve {error: false, message: [...], totalPages: number}
        const comments = (response.message || []).map((comment: any) => ({
          id: comment.id,
          comment: comment.comment || comment.text || '',
          rating: comment.rating || 0,
          createdAt: comment.createdAt || comment.created_at || new Date().toISOString(),
          userDetailDTO: {
            id: comment.user?.id || comment.userDetailDTO?.id || '',
            name: comment.user?.name || comment.userDetailDTO?.name || 'Usuario',
            photoUrl: comment.user?.photoUrl || comment.user?.photo_url || comment.userDetailDTO?.photoUrl || '/assets/img/fallback.svg',
            createdAt: comment.user?.createdAt || comment.user?.created_at || comment.userDetailDTO?.createdAt || new Date().toISOString()
          }
        }));

        return {
          comments: comments,
          totalPages: response.totalPages || 1
        };
      })
    );
  }

  public getForUpdate(id: string): Observable<GetForUpdateDTO> {
    return this.http.get<GetForUpdateDTO>(`${this.apiUrl}/update/${id}`, {
      headers: this.getAuthHeaders()
    }).pipe(
      map((response: any) => {
        // El backend devuelve {error: false, message: {...}}
        return response.message || response;
      })
    );
  }

  public search(filters: SearchFiltersDTO, page: number = 0): Observable<AccommodationDTO[]> {
    const params = { ...filters, page: page.toString() } as any;
    return this.http.get<AccommodationDTO[]>(`${this.apiUrl}/search`, {
      headers: this.getAuthHeaders(),
      params
    }).pipe(
      map((response: any) => {
        // El backend devuelve {error: false, message: [...]}
        return response.message || [];
      })
    );
  }

  public searchWithBody(filters: SearchFiltersDTO, page: number = 0): Observable<AccommodationDTO[]> {
    // Endpoint público - no requiere autenticación
    const body = {
      city: filters.city || null,
      checkIn: filters.checkIn || null,
      checkOut: filters.checkOut || null,
      guest_number: filters.guest_number || null,
      minimum: filters.minimum || null,
      maximum: filters.maximum || null,
      list: filters.list || null
    };

    return this.http.post<AccommodationDTO[]>(`${this.apiUrl}/${page}`, body).pipe(
      map((response: any) => {
        // El backend devuelve {error: false, message: [...]}
        return response?.message || [];
      })
    );
  }

  /**
    * Lista lugares con paginación
    * @param page Número de página (0-based)
    * @returns Observable con lista de lugares y total de páginas
    */
  public getPlacesWithPagination(page: number = 0): Observable<{places: AccommodationDTO[], totalPages: number}> {
    const params = new HttpParams().set('page', page.toString());

    return this.http.get<any>(`${this.apiUrl}/list`, {
      headers: this.getAuthHeaders(),
      params
    }).pipe(
      map((response: any) => {
        // El backend devuelve {error: false, message: [...], totalPages: number}
        return {
          places: response.message || [],
          totalPages: response.totalPages || 1
        };
      })
    );
  }

  /**
    * Lista alojamientos del host autenticado con paginación
    * @param page Número de página (0-based)
    * @returns Observable con lista de alojamientos del host y total de páginas
    */
  public getHostAccommodations(page: number = 0): Observable<{places: AccommodationDTO[], totalPages: number}> {
    return this.http.get<any>(`http://localhost:8080/api/users/me/accommodations/host/${page}`, {
      headers: this.getAuthHeaders()
    }).pipe(
      map((response: any) => {
        // El backend devuelve {error: false, message: [...], totalPages: number}
        return {
          places: response.message || [],
          totalPages: response.totalPages || 1
        };
      })
    );
  }

  /**
    * Obtiene estadísticas de un alojamiento
    * @param id ID del alojamiento
    * @param dateFilter Filtros de fecha opcionales
    * @returns Observable con estadísticas
    */
  public getAccommodationStats(id: string, dateFilter: StatsDateDTO): Observable<StatsDTO> {
    return this.http.post<StatsDTO>(`${this.apiUrl}/${id}/stats`, dateFilter, {
      headers: this.getAuthHeaders()
    }).pipe(
      map((response: any) => {
        // El backend devuelve {error: false, message: {...}}
        return response.message || response;
      })
    );
  }

}
