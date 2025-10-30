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
  amenitiesOptions: { label: string; value: string }[];


  createPlaceForm!: FormGroup;

  constructor(private formBuilder: FormBuilder) {
    this.createForm();
    this.cities = ['Bogotá', 'Medellín', 'Cali','Armenia', 'Barranquilla', 'Cartagena'];
    this.accommodationTypes = ['HOUSE', 'APARTMENT', 'FARM'];
    this.amenitiesOptions = [
      { label: 'Wifi', value: 'WIFI' },
      { label: 'Parqueadero', value: 'PARKING_AND_FACILITIES' },
      { label: 'Aire acondicionado', value: 'SERVICES' },
      { label: 'Lavanderia', value: 'BEDROOM_AND_LAUNDRY' },
      { label: 'Apto para mascotas', value: 'SERVICE_ANIMALS_ALLOWED' },
      { label: 'Congelador', value: 'FREEZER' },
      { label: 'Agua caliente', value: 'HOT_WATER' },
      { label: 'Cocina', value: 'KITCHEN' },
      { label: 'TV', value: 'ENTERTAINMENT' }
    ];
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
      postalCode: ['', [Validators.required]],
      amenities: [[], []],
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
    this.createPlaceForm.patchValue({ picsUrl: files });
    this.createPlaceForm.get('picsUrl')?.updateValueAndValidity();
  }
  }

  // Este metodo mantiene sincronizado el control de formulario de amenidades
  // según el estado de cada checkbox seleccionado
  public onAmenityToggle(amenity: string, checked: boolean) {
    const amenitiesControl = this.createPlaceForm.get('amenities');
    if (!amenitiesControl) {
      return;
    }

    const currentAmenities: string[] = amenitiesControl.value || [];
    if (checked) {
      if (!currentAmenities.includes(amenity)) {
        amenitiesControl.setValue([...currentAmenities, amenity]);
      }
    } else {
      amenitiesControl.setValue(currentAmenities.filter(item => item !== amenity));
    }
    amenitiesControl.updateValueAndValidity();
  }




}

