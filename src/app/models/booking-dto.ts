export interface CreateBookingDTO {
  checkIn: string;
  checkOut: string;
  guest_number: number;
  accommodationCode: string;
}

export interface BookingDTO {
  id: string;
  checkIn: string;
  checkOut: string;
  guest_number: number;
  accommodationCode: string;
  status: string;
  userId: string;
  accommodationTitle?: string;
}