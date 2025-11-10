import { Component, OnInit, AfterViewInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators} from '@angular/forms';
import { Router } from '@angular/router';
import { MapService } from '../../services/map-service';
import Swal from 'sweetalert2';


@Component({
  selector: 'app-create-place',
  imports: [ReactiveFormsModule],
  templateUrl: './create-place.html',
  styleUrl: './create-place.css'
})
export class CreatePlace implements OnInit, AfterViewInit {

  cities: string[];
  accommodationTypes: string[];
  amenitiesOptions: { label: string; value: string }[];


  createPlaceForm!: FormGroup;

  constructor(private formBuilder: FormBuilder, private mapService: MapService, private router: Router) {
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

  ngOnInit(): void {
    // Inicializa el mapa con la configuración predeterminada
    this.mapService.create();
  }

  ngAfterViewInit(): void {
    // Se suscribe al evento de agregar marcador y actualiza el formulario después de que la vista esté inicializada
    this.mapService.addMarker().subscribe((marker) => {
      this.createPlaceForm.get('location')?.setValue({
        latitude: marker.lat,
        longitude: marker.lng,
      });
    });
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
      location: [null, [Validators.required]],
      picsUrl: [[], [Validators.required]]
      
    });

  }

  public createPlace() {
    if (this.createPlaceForm.valid) {
      try {
        // Aquí iría la lógica para enviar al backend
        console.log('Valores del formulario:', this.createPlaceForm.value);

        // Simular creación exitosa (ya que no hay backend aún)
        const mockPlaceId = Math.floor(Math.random() * 1000) + 1;

        Swal.fire({
          title: "¡Éxito!",
          text: "Se ha creado un nuevo alojamiento.",
          icon: "success",
          timer: 2000,
          showConfirmButton: false
        }).then(() => {
          // Resetear el formulario
          this.createPlaceForm.reset();
          // Limpiar marcadores del mapa
          this.mapService.clearMarkers();
          // Redirigir al detalle del alojamiento
          this.router.navigate(['/place-detail', mockPlaceId]);
        });
      } catch (error) {
        console.error('Error al crear el alojamiento:', error);
        Swal.fire("Error", "Ocurrió un error al crear el alojamiento. Inténtalo de nuevo.", "error");
      }
    } else {
      Swal.fire("Error", "Por favor complete todos los campos requeridos.", "error");
    }
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

