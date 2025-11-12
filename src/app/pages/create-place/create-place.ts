import { Component, OnInit, AfterViewInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators} from '@angular/forms';
import { Router } from '@angular/router';
import { MapService } from '../../services/map-service';
import { PlacesService } from '../../services/places-service';
import { ImageService } from '../../services/image-service';
import { CreateAccommodationDTO } from '../../models/place-dto';
import { forkJoin } from 'rxjs';
import { CommonModule } from '@angular/common';
import Swal from 'sweetalert2';


@Component({
  selector: 'app-create-place',
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './create-place.html',
  styleUrl: './create-place.css'
})
export class CreatePlace implements OnInit, AfterViewInit {

  cities: string[];
  accommodationTypes: string[];
  amenitiesOptions: { label: string; value: string }[] = [];


  createPlaceForm!: FormGroup;

  constructor(private formBuilder: FormBuilder, private mapService: MapService, private router: Router, private placesService: PlacesService, private imageService: ImageService) {
    this.createForm();
    this.cities = ['Bogotá', 'Medellín', 'Cali','Armenia', 'Barranquilla', 'Cartagena'];
    this.accommodationTypes = ['HOUSE', 'APARTMENT', 'FARM'];
    this.loadAmenities();
  }

  private loadAmenities() {
    console.log('Intentando cargar amenities desde backend...');
    this.placesService.getAmenities().subscribe({
      next: (amenities: string[]) => {
        console.log('Amenities cargados desde backend:', amenities);
        this.amenitiesOptions = amenities.map(amenity => ({
          label: this.formatAmenityLabel(amenity),
          value: amenity
        }));
        console.log('Amenities procesados:', this.amenitiesOptions);
      },
      error: (error: any) => {
        console.error('Error loading amenities:', error);
        console.log('Usando amenities por defecto...');
        // Fallback to hardcoded amenities if backend fails
        this.amenitiesOptions = [
          { label: 'Wifi', value: 'wifi' },
          { label: 'Cocina', value: 'cocina' },
          { label: 'Estacionamiento gratuito', value: 'estacionamiento_gratuito' },
          { label: 'Aire acondicionado', value: 'aire_acondicionado' },
          { label: 'Calefacción', value: 'calefacción' },
          { label: 'Lavadora', value: 'lavadora' },
          { label: 'Secadora', value: 'secadora' },
          { label: 'Televisión', value: 'televisión' },
          { label: 'Se aceptan mascotas', value: 'se_aceptan_mascotas' },
          { label: 'Llegada autónoma', value: 'llegada_autónoma' }
        ];
        console.log('Amenities por defecto cargados:', this.amenitiesOptions);
      }
    });
  }

  private formatAmenityLabel(amenity: string): string {
    return amenity
      .replace(/_/g, ' ')
      .replace(/\b\w/g, l => l.toUpperCase());
  }


  ngOnInit(): void {
    // Inicializa el mapa con la configuración predeterminada
    this.mapService.create();
  }

  ngAfterViewInit(): void {
    // Se suscribe al evento de agregar marcador y actualiza el formulario después de que la vista esté inicializada
    this.mapService.addMarker().subscribe((marker) => {
      this.createPlaceForm.get('latitude')?.setValue(marker.lat);
      this.createPlaceForm.get('longitude')?.setValue(marker.lng);
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
      country: ['Colombia', [Validators.required]],
      department: ['', [Validators.required]],
      city: ['', [Validators.required]],
      neighborhood: ['', []],
      street: ['', []],
      postalCode: ['', [Validators.required]],
      latitude: ['', [Validators.required]],
      longitude: ['', [Validators.required]],
      amenities: [[], []],
      picsUrl: [[], []]

    });

  }

  public createPlace() {
    if (this.createPlaceForm.valid) {
      const formValue = this.createPlaceForm.value;
      const files: File[] = formValue.picsUrl || [];

      /**if (files.length < 3 || files.length > 8) {
        Swal.fire("Error", "Debe seleccionar entre 3 y 8 imágenes.", "error");
        return;
      }*/

      // Mostrar loading
      Swal.fire({
        title: "Subiendo imágenes...",
        text: "Por favor espera mientras se suben las imágenes.",
        allowOutsideClick: false,
        showConfirmButton: false,
        willOpen: () => {
          Swal.showLoading();
        }
      });

      // Subir todas las imágenes primero
      const uploadObservables = files.map(file => this.imageService.uploadImage(file));

      forkJoin(uploadObservables).subscribe({
        next: (uploadResponses: any[]) => {
          // Extraer URLs de las respuestas (ajustar según el formato real del backend)
          const picsUrls = uploadResponses.map(response => response.data?.url || response.url);

          // Preparar el DTO para crear el alojamiento
          const accommodationData: CreateAccommodationDTO = {
            title: formValue.title,
            description: formValue.description,
            price: parseFloat(formValue.price),
            picsUrl: picsUrls,
            accommodationType: formValue.accommodationType,
            capacity: parseInt(formValue.capacity),
            country: formValue.country,
            department: formValue.department,
            city: formValue.city,
            neighborhood: formValue.neighborhood || undefined,
            street: formValue.street || undefined,
            postalCode: formValue.postalCode,
            amenities: formValue.amenities || [],
            latitude: parseFloat(formValue.latitude),
            longitude: parseFloat(formValue.longitude)
          };

          // Cerrar loading de imágenes y mostrar loading de creación
          Swal.close();
          Swal.fire({
            title: "Creando alojamiento...",
            text: "Por favor espera.",
            allowOutsideClick: false,
            showConfirmButton: false,
            willOpen: () => {
              Swal.showLoading();
            }
          });

          // Crear el alojamiento
          this.placesService.save(accommodationData).subscribe({
            next: (response) => {
              Swal.close();
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
                // Redirigir al detalle del alojamiento (asumiendo que response es el ID)
                this.router.navigate(['/place-detail', response]);
              });
            },
            error: (error: any) => {
              Swal.close();
              console.error('Error al crear el alojamiento:', error);
              console.log('Detalles del error:', error.error);
              const errorMessage = error.error?.message?.[0] || "Ocurrió un error al crear el alojamiento. Inténtalo de nuevo.";
              Swal.fire("Error", errorMessage, "error");
            }
          });
        },
        error: (error) => {
          Swal.close();
          console.error('Error al subir imágenes:', error);
          Swal.fire("Error", "Ocurrió un error al subir las imágenes. Inténtalo de nuevo.", "error");
        }
      });
    } else {
      Swal.fire("Error", "Por favor complete todos los campos requeridos.", "error");
    }
  }

  public onFileChange(event: Event) {
    const input = event.target as HTMLInputElement;

    if (input.files && input.files.length > 0) {
      const files = Array.from(input.files);
      this.createPlaceForm.patchValue({ picsUrl: files });
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

