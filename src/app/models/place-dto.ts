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
  | 'WIFI'
  | 'PARKING_AND_FACILITIES'
  | 'SERVICES'
  | 'BEDROOM_AND_LAUNDRY'
  | 'SERVICE_ANIMALS_ALLOWED'
  | 'FREEZER'
  | 'HOT_WATER'
  | 'KITCHEN'
  | 'ENTERTAINMENT';

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
  id: number;  // Agregado
  title: string;
  price: number;
  photoUrl: string;
  average_rating: number;
  city: string;
  latitude: number;  // Agregado
  longitude: number;  // Agregado
  images: string[];  // Agregado (array de URLs)
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




