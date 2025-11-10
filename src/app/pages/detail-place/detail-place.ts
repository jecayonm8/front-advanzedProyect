import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { PlacesService } from '../../services/places-service';
import { AccommodationDTO } from '../../models/place-dto';
import { JsonPipe } from '@angular/common';

@Component({
  selector: 'app-detail-place',
  imports: [JsonPipe],
  templateUrl: './detail-place.html',
  styleUrl: './detail-place.css'
})
export class DetailPlace {

  placeId: string = "";
  place: AccommodationDTO | undefined;

  constructor(private route: ActivatedRoute, private placesServices: PlacesService){
    this.route.params.subscribe( (params) => {
      this.placeId = params["id"];
      this.get(this.placeId);
    });
  }

  public get(placeID: string){
    // El id que se recibe por la url es de tipo string, pero en el servicio es de tipo number por eso se hace el parseInt
    const selectedPlace = this.placesServices.get(parseInt(placeID));
    if(selectedPlace != undefined){
      this.place = selectedPlace;
    }
  }

}