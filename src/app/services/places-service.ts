import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpRequest, HttpResponse, HttpParams } from '@angular/common/http';
import { Observable, of, map, filter } from 'rxjs';
import { AccommodationDTO, CreateAccommodationDTO, PlaceDTO, AccommodationDetailDTO, GetForUpdateDTO, UpdateAccommodationDTO, SearchFiltersDTO, CommentDTO, StatsDTO, StatsDateDTO } from '../models/place-dto';

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
    const token = sessionStorage.getItem('AuthToken');
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': token ? `Bearer ${token}` : ''
    });
  }


  public getAllSync(): AccommodationDTO[] {
    return this.places;
  }

  public save(newPlace: CreateAccommodationDTO): Observable<string> {
    return this.http.post<string>(this.apiUrl, newPlace, {
      headers: this.getAuthHeaders()
    });
  }

  public update(id: string, updatedPlace: UpdateAccommodationDTO): Observable<string> {
    return this.http.put<string>(`${this.apiUrl}/${id}`, updatedPlace, {
      headers: this.getAuthHeaders()
    });
  }

  public deleteAccommodation(id: string): Observable<string> {
    return this.http.delete<string>(`${this.apiUrl}/${id}`, {
      headers: this.getAuthHeaders()
    });
  }

  public get(id: number): AccommodationDTO | undefined {
    // Por ahora buscar en datos locales, después activar HTTP:
    // return this.http.get<AccommodationDTO>(`${this.apiUrl}/${id}`, {
    //   headers: this.getAuthHeaders()
    // });

    // Búsqueda local para desarrollo
    return this.places.find(place => parseInt(place.id) === id);
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
    return this.http.get<AccommodationDTO[]>(`${this.apiUrl}/${page}`, {
      headers: this.getAuthHeaders(),
      params: filters as any // Convertir nulls a undefined para query params, pero como es body, usar body
    }).pipe(
      map((response: any) => {
        // El backend devuelve {error: false, message: [...]}
        return response.message || [];
      })
    );
  }

  public searchWithBody(filters: SearchFiltersDTO, page: number = 0): Observable<AccommodationDTO[]> {
    // Endpoint público - no requiere autenticación
    return this.http.post<AccommodationDTO[]>(`${this.apiUrl}/${page}`, filters, {
      headers: new HttpHeaders({
        'Content-Type': 'application/json'
      })
    }).pipe(
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
