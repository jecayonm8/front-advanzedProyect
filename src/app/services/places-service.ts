import { Injectable } from '@angular/core';
import { AccommodationDTO, CreateAccommodationDTO } from '../models/place-dto';

@Injectable({
  providedIn: 'root'
})
export class PlacesService {
  private places: AccommodationDTO[];
  
  constructor(){
    this.places = this.createTestPlaces();
  }

  public getAll(): AccommodationDTO[] {
    return this.places;
  }

  public save(newPlace: CreateAccommodationDTO) {
    const newAccommodation: AccommodationDTO = {
      title: newPlace.title,
      price: newPlace.price,
      photo_url: newPlace.picsUrl[0] ?? '',
      average_rating: 0,
      city: newPlace.city
    };

    this.places = [...this.places, newAccommodation];
  }

  private createTestPlaces(): AccommodationDTO[] {

    return [
      {
        title: 'Casa de Campo El Roble',
        price: 250000,
        photo_url: 'https://example.com/images/campo1.jpg',
        average_rating: 4.8,
        city: 'Manizales'
      },
      {
        title: 'Apartamento Moderno en el Centro',
        price: 180000,
        photo_url: 'https://example.com/images/apto1.jpg',
        average_rating: 4.5,
        city: 'Bogotá'
      },
      {
        title: 'Cabaña en el Lago Azul',
        price: 300000,
        photo_url: 'https://example.com/images/lago1.jpg',
        average_rating: 4.9,
        city: 'Guatapé'
      }
    ];
  }
}
