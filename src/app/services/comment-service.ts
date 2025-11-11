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
    const token = sessionStorage.getItem('AuthToken');
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
    return this.http.post<CommentDTO>(`${this.API_URL}/create`, commentData, {
      headers: this.getAuthHeaders()
    });
  }

  // Método mock para desarrollo (sin backend)
  getMockComments(accommodationId: string, page: number = 0): CommentDTO[] {
    const allMockComments: CommentDTO[] = [
      {
        id: '1',
        comment: 'Excelente lugar, muy cómodo y bien ubicado. El propietario fue muy amable.',
        rating: 5,
        createdAt: '2024-11-01T14:30:00',
        userDetailDTO: {
          id: 'user1',
          name: 'Ana García',
          photoUrl: 'https://example.com/profiles/ana.jpg',
          createdAt: '2024-01-15T10:30:00'
        }
      },
      {
        id: '2',
        comment: 'Buen alojamiento, pero le faltó un poco de limpieza. Por lo demás, todo bien.',
        rating: 4,
        createdAt: '2024-10-28T09:15:00',
        userDetailDTO: {
          id: 'user2',
          name: 'Carlos Rodríguez',
          photoUrl: 'https://example.com/profiles/carlos.jpg',
          createdAt: '2024-02-20T15:45:00'
        }
      },
      {
        id: '3',
        comment: 'Increíble experiencia. La casa superó mis expectativas. Definitivamente volveré.',
        rating: 5,
        createdAt: '2024-10-25T16:45:00',
        userDetailDTO: {
          id: 'user3',
          name: 'María López',
          photoUrl: 'https://example.com/profiles/maria.jpg',
          createdAt: '2024-03-10T12:00:00'
        }
      },
      {
        id: '4',
        comment: 'La ubicación es perfecta, cerca de todo lo necesario. Recomiendo ampliamente.',
        rating: 4,
        createdAt: '2024-10-20T11:20:00',
        userDetailDTO: {
          id: 'user4',
          name: 'Juan Pérez',
          photoUrl: 'https://example.com/profiles/juan.jpg',
          createdAt: '2024-04-05T09:30:00'
        }
      },
      {
        id: '5',
        comment: 'Muy buena relación calidad-precio. Todo funcionó perfectamente durante nuestra estadía.',
        rating: 5,
        createdAt: '2024-10-15T18:10:00',
        userDetailDTO: {
          id: 'user5',
          name: 'Laura Martínez',
          photoUrl: 'https://example.com/profiles/laura.jpg',
          createdAt: '2024-05-12T14:20:00'
        }
      },
      {
        id: '6',
        comment: 'El lugar es tal como se describe en las fotos. Muy satisfecho con la experiencia.',
        rating: 4,
        createdAt: '2024-10-10T13:45:00',
        userDetailDTO: {
          id: 'user6',
          name: 'Pedro Sánchez',
          photoUrl: 'https://example.com/profiles/pedro.jpg',
          createdAt: '2024-06-18T16:15:00'
        }
      },
      {
        id: '7',
        comment: 'Excelente atención del propietario. Nos sentimos muy bienvenidos.',
        rating: 5,
        createdAt: '2024-10-05T10:30:00',
        userDetailDTO: {
          id: 'user7',
          name: 'Sofia Ramírez',
          photoUrl: 'https://example.com/profiles/sofia.jpg',
          createdAt: '2024-07-22T11:40:00'
        }
      },
      {
        id: '8',
        comment: 'Todo estuvo bien, pero el WiFi podría ser más rápido. Por lo demás, perfecto.',
        rating: 3,
        createdAt: '2024-09-30T15:20:00',
        userDetailDTO: {
          id: 'user8',
          name: 'Diego Torres',
          photoUrl: 'https://example.com/profiles/diego.jpg',
          createdAt: '2024-08-14T13:25:00'
        }
      },
      {
        id: '9',
        comment: 'Una experiencia maravillosa. El lugar es mágico y el propietario muy atento.',
        rating: 5,
        createdAt: '2024-09-25T12:15:00',
        userDetailDTO: {
          id: 'user9',
          name: 'Valentina Gómez',
          photoUrl: 'https://example.com/profiles/valentina.jpg',
          createdAt: '2024-09-01T10:50:00'
        }
      },
      {
        id: '10',
        comment: 'Recomiendo este lugar a todos mis amigos. Excelente elección.',
        rating: 5,
        createdAt: '2024-09-20T17:40:00',
        userDetailDTO: {
          id: 'user10',
          name: 'Andrés Morales',
          photoUrl: 'https://example.com/profiles/andres.jpg',
          createdAt: '2024-10-01T15:30:00'
        }
      },
      {
        id: '11',
        comment: 'Buen lugar para descansar. Tranquilo y con todas las comodidades necesarias.',
        rating: 4,
        createdAt: '2024-09-15T14:25:00',
        userDetailDTO: {
          id: 'user11',
          name: 'Camila Herrera',
          photoUrl: 'https://example.com/profiles/camila.jpg',
          createdAt: '2024-10-05T12:20:00'
        }
      },
      {
        id: '12',
        comment: 'La casa es hermosa y está muy bien equipada. Volveremos pronto.',
        rating: 5,
        createdAt: '2024-09-10T16:35:00',
        userDetailDTO: {
          id: 'user12',
          name: 'Felipe Castro',
          photoUrl: 'https://example.com/profiles/felipe.jpg',
          createdAt: '2024-10-10T09:45:00'
        }
      },
      {
        id: '13',
        comment: 'Excelente ubicación y comodidades. El precio es muy competitivo.',
        rating: 4,
        createdAt: '2024-09-05T14:20:00',
        userDetailDTO: {
          id: 'user13',
          name: 'Isabella Vargas',
          photoUrl: 'https://example.com/profiles/isabella.jpg',
          createdAt: '2024-10-15T11:30:00'
        }
      },
      {
        id: '14',
        comment: 'Todo perfecto, desde la reserva hasta la salida. Muy recomendado.',
        rating: 5,
        createdAt: '2024-08-30T10:15:00',
        userDetailDTO: {
          id: 'user14',
          name: 'Mateo Silva',
          photoUrl: 'https://example.com/profiles/mateo.jpg',
          createdAt: '2024-10-20T13:45:00'
        }
      },
      {
        id: '15',
        comment: 'Buena experiencia general. El lugar cumple con lo prometido.',
        rating: 4,
        createdAt: '2024-08-25T17:40:00',
        userDetailDTO: {
          id: 'user15',
          name: 'Gabriela Ruiz',
          photoUrl: 'https://example.com/profiles/gabriela.jpg',
          createdAt: '2024-10-25T15:20:00'
        }
      },
      {
        id: '16',
        comment: 'Increíble atención al detalle. Todo estaba impecable.',
        rating: 5,
        createdAt: '2024-08-20T12:30:00',
        userDetailDTO: {
          id: 'user16',
          name: 'Lucas Mendoza',
          photoUrl: 'https://example.com/profiles/lucas.jpg',
          createdAt: '2024-10-30T09:15:00'
        }
      },
      {
        id: '17',
        comment: 'El lugar es acogedor y funcional. Ideal para familias.',
        rating: 4,
        createdAt: '2024-08-15T15:25:00',
        userDetailDTO: {
          id: 'user17',
          name: 'Valeria Ortega',
          photoUrl: 'https://example.com/profiles/valeria.jpg',
          createdAt: '2024-11-01T14:10:00'
        }
      },
      {
        id: '18',
        comment: 'Excelente relación calidad-precio. Superó nuestras expectativas.',
        rating: 5,
        createdAt: '2024-08-10T11:50:00',
        userDetailDTO: {
          id: 'user18',
          name: 'Santiago Delgado',
          photoUrl: 'https://example.com/profiles/santiago.jpg',
          createdAt: '2024-11-05T16:35:00'
        }
      },
      {
        id: '19',
        comment: 'Muy buena limpieza y organización. Todo funcionó perfectamente.',
        rating: 4,
        createdAt: '2024-08-05T13:15:00',
        userDetailDTO: {
          id: 'user19',
          name: 'Fernanda Navarro',
          photoUrl: 'https://example.com/profiles/fernanda.jpg',
          createdAt: '2024-11-10T10:40:00'
        }
      },
      {
        id: '20',
        comment: 'Una experiencia única. El lugar tiene mucho encanto.',
        rating: 5,
        createdAt: '2024-07-30T18:20:00',
        userDetailDTO: {
          id: 'user20',
          name: 'Emiliano Flores',
          photoUrl: 'https://example.com/profiles/emiliano.jpg',
          createdAt: '2024-11-15T12:25:00'
        }
      },
      {
        id: '21',
        comment: 'Recomiendo este alojamiento sin dudarlo. Excelente en todos los aspectos.',
        rating: 5,
        createdAt: '2024-07-25T16:45:00',
        userDetailDTO: {
          id: 'user21',
          name: 'Renata Guzmán',
          photoUrl: 'https://example.com/profiles/renata.jpg',
          createdAt: '2024-11-20T08:55:00'
        }
      },
      {
        id: '22',
        comment: 'Buen lugar, pero el ruido de la calle fue un poco molesto por las noches.',
        rating: 3,
        createdAt: '2024-07-20T14:30:00',
        userDetailDTO: {
          id: 'user22',
          name: 'Joaquín Medina',
          photoUrl: 'https://example.com/profiles/joaquin.jpg',
          createdAt: '2024-11-25T17:40:00'
        }
      },
      {
        id: '23',
        comment: 'Todo estuvo bien organizado. El propietario fue muy servicial.',
        rating: 4,
        createdAt: '2024-07-15T10:25:00',
        userDetailDTO: {
          id: 'user23',
          name: 'Antonia Vega',
          photoUrl: 'https://example.com/profiles/antonia.jpg',
          createdAt: '2024-11-30T15:15:00'
        }
      },
      {
        id: '24',
        comment: 'Increíble experiencia. Volveremos definitivamente.',
        rating: 5,
        createdAt: '2024-07-10T12:40:00',
        userDetailDTO: {
          id: 'user24',
          name: 'Maximiliano Reyes',
          photoUrl: 'https://example.com/profiles/maximiliano.jpg',
          createdAt: '2024-12-01T11:20:00'
        }
      },
      {
        id: '25',
        comment: 'El lugar cumple con todas las expectativas. Muy satisfecho.',
        rating: 4,
        createdAt: '2024-07-05T19:35:00',
        userDetailDTO: {
          id: 'user25',
          name: 'Constanza Muñoz',
          photoUrl: 'https://example.com/profiles/constanza.jpg',
          createdAt: '2024-12-05T13:50:00'
        }
      },
      {
        id: '26',
        comment: 'Excelente ubicación y comodidades modernas.',
        rating: 5,
        createdAt: '2024-06-30T15:55:00',
        userDetailDTO: {
          id: 'user26',
          name: 'Benjamín Aguilar',
          photoUrl: 'https://example.com/profiles/benjamin.jpg',
          createdAt: '2024-12-10T09:30:00'
        }
      },
      {
        id: '27',
        comment: 'Muy buena experiencia. El lugar es tal como se describe.',
        rating: 4,
        createdAt: '2024-06-25T11:10:00',
        userDetailDTO: {
          id: 'user27',
          name: 'Amanda Ponce',
          photoUrl: 'https://example.com/profiles/amanda.jpg',
          createdAt: '2024-12-15T16:45:00'
        }
      },
      {
        id: '28',
        comment: 'Recomiendo ampliamente este alojamiento. Todo perfecto.',
        rating: 5,
        createdAt: '2024-06-20T13:25:00',
        userDetailDTO: {
          id: 'user28',
          name: 'Thiago Cortés',
          photoUrl: 'https://example.com/profiles/thiago.jpg',
          createdAt: '2024-12-20T14:20:00'
        }
      },
      {
        id: '29',
        comment: 'Buen lugar con excelente atención del propietario.',
        rating: 4,
        createdAt: '2024-06-15T17:50:00',
        userDetailDTO: {
          id: 'user29',
          name: 'Julieta Paredes',
          photoUrl: 'https://example.com/profiles/julieta.jpg',
          createdAt: '2024-12-25T10:35:00'
        }
      },
      {
        id: '30',
        comment: 'Una estadía maravillosa. Todo superó nuestras expectativas.',
        rating: 5,
        createdAt: '2024-06-10T14:15:00',
        userDetailDTO: {
          id: 'user30',
          name: 'Leonardo Soto',
          photoUrl: 'https://example.com/profiles/leonardo.jpg',
          createdAt: '2024-12-30T12:40:00'
        }
      }
    ];

    // Simular paginación: devolver máximo 10 comentarios por página
    const startIndex = page * 10;
    const endIndex = Math.min(startIndex + 10, allMockComments.length);
    return allMockComments.slice(startIndex, endIndex);
  }
}