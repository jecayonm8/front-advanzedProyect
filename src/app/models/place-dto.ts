export interface AccommodationDTO {
  id: string;
  title: string;
  price: number;
  photo_url: string;
  average_rating: number;
  city: string;
  latitude: number;
  longitude: number;
}

export type AccommodationType =
  | 'HOUSE'
  | 'APARTMENT'
  | 'FARM';

export type Amenities =
  | 'wifi'
  | 'cocina'
  | 'estacionamiento_gratuito'
  | 'aire_acondicionado'
  | 'calefacción'
  | 'lavadora'
  | 'secadora'
  | 'televisión'
  | 'se_aceptan_mascotas'
  | 'llegada_autónoma';

export interface CreateAccommodationDTO {
  title: string;
  description: string;
  price: number;
  picsUrl: string[];
  accommodationType: AccommodationType;
  capacity: number;
  country: string;
  department: string;
  city: string;
  neighborhood?: string;
  street?: string;
  postalCode: string;
  amenities: Amenities[];
  latitude: number;
  longitude: number;
}
export interface AccommodationDetailDTO {
  id: number;
  title: string;
  description: string;
  price: number;
  capacity: number;
  averageRating: number;
  latitude: number;
  longitude: number;
  picsUrl: string[];
  amenities: Amenities[];
  userDetailDTO: UserDetailDTO;
}

export interface UpdateAccommodationDTO {
  title: string;
  description: string;
  capacity: number;
  price: number;
  country: string;
  department: string;
  city: string;
  neighborhood?: string;
  street?: string;
  postalCode: string;
  picsUrl: string[];
  amenities: Amenities[];
  accommodationType: AccommodationType;
  latitude: number;
  longitude: number;
}

export interface PlaceDTO {
    id: number;
    title: string;
    description: string;
    images: string[];
    services: string[];
    maxGuests: number;
    pricePerNight: number;
    hostId: string;
    address: AddressDTO;
}

export interface AddressDTO{
    city: string;
    address: string;
    location: LocationDTO;
}
export interface LocationDTO{
     latitude: number;
     longitude: number;
 }

export interface UserDetailDTO {
  id: string;
  name: string;
  photoUrl: string;
  createdAt: string;
}

export interface CommentDTO {
  id: string;
  comment: string;
  rating: number;
  createdAt: string;
  userDetailDTO: UserDetailDTO;
}

export interface CreateCommentDTO {
  comment: string;
  rating: number;
  bookingId: string;
  accommodationId: string;
}


