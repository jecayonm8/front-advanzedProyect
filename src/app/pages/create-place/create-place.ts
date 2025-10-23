import { Component } from '@angular/core';
import { AbstractControlOptions, FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';


@Component({
  selector: 'app-create-place',
  imports: [ReactiveFormsModule],
  templateUrl: './create-place.html',
  styleUrl: './create-place.css'
})
export class CreatePlace {

  createPlaceForm!: FormGroup;

  constructor(private formBuilder: FormBuilder) {
    this.createForm();
  }

  //(recuerde que los nombres de los campos deben coincidir con los del DTO de crear alojamiento o accommodation)
  private createForm() {
  this.createPlaceForm = this.formBuilder.group({
    title: ['', [Validators.required]],
    description: ['', [Validators.required]],
    price: ['', [Validators.required, Validators.pattern(/^[0-9]+$/),Validators.min(1)]],
    accommodationType: ['', [Validators.required]],
    capacity: ['', [Validators.required, Validators.pattern(/^[0-9]+$/), Validators.min(1)]],
    country: ['', [Validators.required]],
    department: ['', [Validators.required]],
    city: ['', [Validators.required]],
    neighborhood: ['', [Validators]],
    postalCode: ['', [Validators.required, Validators.pattern(/^[0-9]{5}$/)]],
    amenities: ['', [Validators]],
    latitude: ['', [Validators.required, Validators.pattern(/^-?\d+(\.\d+)?$/)]],
    longitude: ['', [Validators.required, Validators.pattern(/^-?\d+(\.\d+)?$/)]],
    //address: ['', [Validators.required]],
    //location: ['', [Validators.required]], // Luego se puede mejorar con un mapa
    //maxGuests: ['', [Validators.required, Validators.pattern(/^[0-9]+$/), Validators.min(1)]],
    picsUrl: [[], [Validators.required]]
  });
}


}
