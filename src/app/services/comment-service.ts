import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { CommentDTO, CreateCommentDTO } from '../models/place-dto';

@Injectable({
  providedIn: 'root',
})
export class CommentService {
  private readonly API_URL = 'http://localhost:8080/api/comments';

  constructor(private http: HttpClient) {}

  private getAuthHeaders(): HttpHeaders {
    const token = localStorage.getItem('AuthToken');
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': token ? `Bearer ${token}` : ''
    });
  }

  /**
   * Lista los comentarios de un alojamiento con paginación
   * @param accommodationId ID del alojamiento
   * @param page Número de página (0-based)
   * @returns Observable con lista de comentarios
   */
  listComments(accommodationId: string, page: number = 0): Observable<CommentDTO[]> {
    const params = new HttpParams()
      .set('accommodationId', accommodationId)
      .set('page', page.toString());

    return this.http.get<CommentDTO[]>(`${this.API_URL}/list`, { params });
  }

  /**
   * Lista los comentarios de un alojamiento con paginación (para backend real)
   * @param accommodationId ID del alojamiento
   * @param page Número de página (0-based)
   * @returns Observable con respuesta paginada que incluye total de páginas
   */
  listCommentsWithPagination(accommodationId: string, page: number = 0): Observable<{comments: CommentDTO[], totalPages: number}> {
    const params = new HttpParams()
      .set('accommodationId', accommodationId)
      .set('page', page.toString());

    return this.http.get<any>(`${this.API_URL}/list`, { params }).pipe(
      map((response: any) => {
        // El backend devuelve {error: false, message: [...], totalPages: number}
        return {
          comments: response.message || [],
          totalPages: response.totalPages || 1
        };
      })
    );
  }

  /**
   * Crea un nuevo comentario
   * @param commentData Datos del comentario a crear
   * @returns Observable con el comentario creado
   */
  createComment(commentData: CreateCommentDTO): Observable<CommentDTO> {
    // Usar el endpoint correcto: POST /api/accommodations/{idAccommodation}/comments
    const accommodationsUrl = 'http://localhost:8080/api/accommodations';
    const url = `${accommodationsUrl}/${commentData.accommodationId}/comments`;
    const body = {
      comment: commentData.comment,
      rating: commentData.rating,
      bookingId: commentData.bookingId
    };

    console.log('Creating comment with URL:', url);
    console.log('Request body:', body);
    console.log('Headers:', this.getAuthHeaders());

    return this.http.post<CommentDTO>(url, body, {
      headers: this.getAuthHeaders()
    });
  }
}