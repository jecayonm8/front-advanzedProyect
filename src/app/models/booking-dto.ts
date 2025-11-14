export interface CreateBookingDTO {
  checkIn: string;
  checkOut: string;
  guest_number: number;
  accommodationCode: string;
}

export interface BookingDTO {
  id: string;
  bookingState: string;
  user: UserDTO;
  checkIn: string;
  checkOut: string;
  guest_number: number;
  accommodationId?: string;
}

export interface UserDTO {
  id: string;
  name: string;
  email: string;
}

export interface SearchBookingDTO {
  state?: string;
  checkIn?: string;
  checkOut?: string;
  guest_number?: number;
}