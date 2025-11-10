export interface AccommodationDTO {
  id: string;
  title: string;
  price: number;
  photo_url: string;
  average_rating: number;
  city: string;
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
