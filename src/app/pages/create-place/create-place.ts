import { Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators} from '@angular/forms';


@Component({
  selector: 'app-create-place',
  imports: [ReactiveFormsModule],
  templateUrl: './create-place.html',
  styleUrl: './create-place.css'
})
export class CreatePlace {

  cities: string[];
  accommodationTypes: string[];


  createPlaceForm!: FormGroup;

  constructor(private formBuilder: FormBuilder) {
    this.createForm();
    this.cities = ['Bogotá', 'Medellín', 'Cali','Armenia', 'Barranquilla', 'Cartagena'];
    this.accommodationTypes = ['HOUSE', 'APARTMENT', 'FARM'];
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
      neighborhood: ['', []],
      postalCode: ['', [Validators.required, Validators.pattern(/^[0-9]{5}$/)]],
      amenities: ['', []],
      latitude: ['', [Validators.required]],
      longitude: ['', [Validators.required]],
      picsUrl: [[], [Validators.required]]
      
    });

  }

  public createPlace() { 
    console.log(this.createPlaceForm.value);
  }

  public onFileChange(event: Event) {
  const input = event.target as HTMLInputElement;

  if (input.files && input.files.length > 0) {
    const files = Array.from(input.files);
    this.createPlaceForm.patchValue({ images: files });
  }
  }


}
