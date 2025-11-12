export interface CreateUserDTO {
  name: string;
  surname: string;
  email: string;
  phone: string;
  birthDate: string;
  password: string;
  photoUrl?: string;
  country: string;
  role: 'HOST' | 'USER';
}

export type UserRole = 'HOST' | 'USER';