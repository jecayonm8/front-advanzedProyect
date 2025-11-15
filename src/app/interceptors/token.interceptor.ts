import { HttpInterceptorFn, HttpEventType } from '@angular/common/http';
import { inject } from '@angular/core';
import { tap } from 'rxjs/operators';
import { TokenService } from '../services/token-service';

export const tokenInterceptor: HttpInterceptorFn = (req, next) => {
  const tokenService = inject(TokenService);
  const token = tokenService.getToken();

  console.log('Interceptor: Request to', req.url, 'method:', req.method);

  // Solo agrega el header si el token existe Y no está expirado
  if (token && !tokenService.isTokenExpired()) {
    req = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
    console.log('Interceptor: Added Authorization header');
  } else {
    console.log('Interceptor: No token or expired');
  }

  return next(req).pipe(
    tap({
      next: (event) => {
        if (event.type === HttpEventType.Response) {
          console.log('Interceptor: Response from', req.url, 'status:', event.status);
        }
      },
      error: (error) => {
        console.error('Interceptor: Error for', req.url, error);
      }
    })
  );
};