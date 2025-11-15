import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ImageService {
  private apiUrl = 'https://advanzedproyect-production.up.railway.app/api/images';

  constructor(private http: HttpClient) {}

  private getAuthHeaders(): HttpHeaders {
    const token = sessionStorage.getItem('AuthToken');
    return new HttpHeaders({
      'Authorization': token ? `Bearer ${token}` : ''
    });
  }

  public uploadImage(file: File): Observable<any> {
    const formData = new FormData();
    formData.append('file', file);

    // No incluir Content-Type header para que el navegador lo setee automáticamente con boundary
    // Solo incluir Authorization si hay token (para registro no hay token)
    const token = sessionStorage.getItem('AuthToken');
    const headers = token ? this.getAuthHeaders() : new HttpHeaders();

    return this.http.post<any>(this.apiUrl, formData, {
      headers
    });
  }

  public deleteImage(imageId: string): Observable<any> {
    const headers = this.getAuthHeaders();
    return this.http.delete<any>(`${this.apiUrl}?id=${imageId}`, {
      headers
    });
  }
}