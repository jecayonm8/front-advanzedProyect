import { Injectable } from '@angular/core';

const TOKEN_KEY = "AuthToken";

@Injectable({
  providedIn: 'root'
})
export class TokenService {
  
  // se encarga de guardar el token en el sessionStorage
  private setToken(token: string) {
  sessionStorage.setItem(TOKEN_KEY, token);
  }

  // obtiene el token del sessionStorage
  public getToken(): string | null {
  return sessionStorage.getItem(TOKEN_KEY);
  }

  // verifica si el usuario sigue con token, supongo que se programa para que se esté llamando
  public isLogged(): boolean {
    return !!this.getToken();
  }

  // llama a la funcion de guardar el token
  public login(token: string) {
  this.setToken(token);
}

// borra el token del sessionStorage
public logout() {
  sessionStorage.clear();
}

// para descifrar la informacion del token
private decodePayload(token: string): any {
  try {
    const payload = token.split(".")[1];
    const base64 = payload.replace(/-/g, '+').replace(/_/g, '/');
    return JSON.parse(atob(base64));
  } catch {
    return null;
  }
}

private getPayload(): any {
  const token = this.getToken();
  return token ? this.decodePayload(token) : null;
}
// obtenemos el id del usuario del token
public getUserId(): string {
  return this.getPayload()?.sub || "";
}

// obtenemos el rol del usuario del token
public getRole(): string {
  return this.getPayload()?.role || "";
}

}
