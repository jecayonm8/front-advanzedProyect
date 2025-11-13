import { Component, OnInit, AfterViewInit, OnDestroy } from '@angular/core';
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
export class CreatePlace implements OnInit, AfterViewInit, OnDestroy {

  cities: string[];
  accommodationTypes: string[];
  amenitiesOptions: { label: string; value: string }[] = [];
  selectedFiles: File[] = [];
  imagePreviews: string[] = [];

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
      title: ['', [Validators.required, Validators.minLength(5), Validators.maxLength(100)]],
      description: ['', [Validators.required, Validators.minLength(20), Validators.maxLength(500)]],
      price: ['', [Validators.required, Validators.pattern(/^[0-9]+$/), Validators.min(1), Validators.max(10000000)]],
      accommodationType: ['', [Validators.required]],
      capacity: ['', [Validators.required, Validators.pattern(/^[0-9]+$/), Validators.min(1), Validators.max(50)]],
      country: ['Colombia', [Validators.required]],
      department: ['', [Validators.required, Validators.maxLength(30)]],
      city: ['', [Validators.required, Validators.maxLength(30)]],
      neighborhood: ['', [Validators.maxLength(20)]],
      street: ['', []],
      postalCode: ['', [Validators.required, Validators.pattern(/^[0-9A-Za-z]{4,10}$/)]],
      latitude: ['', [Validators.required]],
      longitude: ['', [Validators.required]],
      amenities: [[], []],
      picsUrl: [[], []]

    });

  }

  public createPlace() {
    if (this.createPlaceForm.valid) {
      const formValue = this.createPlaceForm.value;

      // Validar que haya al menos 1 imagen
      if (this.selectedFiles.length < 1) {
        Swal.fire("Error", "Debes seleccionar al menos 1 imagen del alojamiento.", "error");
        return;
      }

      if (this.selectedFiles.length > 10) {
        Swal.fire("Error", "No puedes subir más de 10 imágenes.", "error");
        return;
      }

      // Mostrar loading
      Swal.fire({
        title: "Subiendo imágenes...",
        text: `Subiendo ${this.selectedFiles.length} imagen(es). Por favor espera.`,
        allowOutsideClick: false,
        showConfirmButton: false,
        willOpen: () => {
          Swal.showLoading();
        }
      });

      // Subir todas las imágenes primero
      const uploadObservables = this.selectedFiles.map(file => this.imageService.uploadImage(file));

      forkJoin(uploadObservables).subscribe({
        next: (uploadResponses: any[]) => {
          console.log('Respuestas de subida de imágenes:', uploadResponses);

          // Extraer URLs de las respuestas usando la misma lógica que en register
          const picsUrls = uploadResponses.map((response, index) => {
            console.log(`Procesando respuesta ${index}:`, response);
            console.log(`Tipo de respuesta ${index}:`, typeof response);
            console.log(`Keys de respuesta ${index}:`, Object.keys(response));

            let imageUrl = null;

            // Intentar diferentes formatos de respuesta
            if (response.data?.url) {
              imageUrl = response.data.url;
              console.log(`URL encontrada en response.data.url (${index}):`, imageUrl);
            } else if (response.url) {
              imageUrl = response.url;
              console.log(`URL encontrada en response.url (${index}):`, imageUrl);
            } else if (response.secure_url) {
              imageUrl = response.secure_url;
              console.log(`URL encontrada en response.secure_url (${index}):`, imageUrl);
            } else if (response.data?.secure_url) {
              imageUrl = response.data.secure_url;
              console.log(`URL encontrada en response.data.secure_url (${index}):`, imageUrl);
            } else if (typeof response === 'string') {
              imageUrl = response;
              console.log(`Respuesta es string directo (${index}):`, imageUrl);
            } else if (response.message?.url) {
              imageUrl = response.message.url;
              console.log(`URL encontrada en response.message.url (${index}):`, imageUrl);
            } else if (response.message?.secure_url) {
              imageUrl = response.message.secure_url;
              console.log(`URL encontrada en response.message.secure_url (${index}):`, imageUrl);
            }

            if (!imageUrl) {
              console.error(`No se pudo obtener la URL de la imagen ${index}. Respuesta completa:`, response);
              console.error(`Estructura de respuesta ${index}:`, JSON.stringify(response, null, 2));
            }

            return imageUrl;
          }).filter(url => url !== null); // Filtrar URLs nulas

          console.log('URLs finales extraídas:', picsUrls);

          if (picsUrls.length === 0) {
            Swal.close();
            Swal.fire("Error", "No se pudieron obtener las URLs de las imágenes subidas. Revisa la consola para más detalles.", "error");
            return;
          }

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

          console.log('Datos del alojamiento a enviar:', accommodationData);
          console.log('picsUrl array:', picsUrls);
          console.log('amenities array:', formValue.amenities);
          console.log('accommodationType:', formValue.accommodationType);
          console.log('price (number):', parseFloat(formValue.price));
          console.log('capacity (number):', parseInt(formValue.capacity));
          console.log('latitude (number):', parseFloat(formValue.latitude));
          console.log('longitude (number):', parseFloat(formValue.longitude));

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
                this.selectedFiles = [];
                // Limpiar previews y liberar memoria
                this.imagePreviews.forEach(preview => URL.revokeObjectURL(preview));
                this.imagePreviews = [];
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

              let errorMessage = "Ocurrió un error al crear el alojamiento. Inténtalo de nuevo.";

              if (error.error?.message) {
                if (Array.isArray(error.error.message)) {
                  errorMessage = error.error.message.join(', ');
                } else if (typeof error.error.message === 'string') {
                  errorMessage = error.error.message;
                }
              }

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
      const newFiles = Array.from(input.files);

      // Validar número de imágenes
      const totalFiles = this.selectedFiles.length + newFiles.length;
      if (totalFiles < 1) {
        Swal.fire("Error", "Debes seleccionar al menos 1 imagen.", "error");
        return;
      }
      if (totalFiles > 10) {
        Swal.fire("Error", "No puedes seleccionar más de 10 imágenes.", "error");
        return;
      }

      // Validar cada archivo
      for (const file of newFiles) {
        // Validar tamaño (5MB máximo)
        if (file.size > 5 * 1024 * 1024) {
          Swal.fire("Error", `La imagen "${file.name}" es demasiado grande. Máximo 5MB por imagen.`, "error");
          return;
        }

        // Validar tipo de archivo
        if (!file.type.startsWith('image/')) {
          Swal.fire("Error", `El archivo "${file.name}" no es una imagen válida. Solo se permiten JPG, PNG y WebP.`, "error");
          return;
        }
      }

      // Agregar archivos válidos
      this.selectedFiles = [...this.selectedFiles, ...newFiles];
      // Generar previews para los nuevos archivos
      const newPreviews = newFiles.map(file => URL.createObjectURL(file));
      this.imagePreviews = [...this.imagePreviews, ...newPreviews];

      this.createPlaceForm.patchValue({ picsUrl: this.selectedFiles });
      this.createPlaceForm.get('picsUrl')?.updateValueAndValidity();

      // Limpiar el input para permitir seleccionar los mismos archivos nuevamente si es necesario
      input.value = '';
    }
  }

  public removeImage(index: number) {
    // Liberar el object URL para evitar memory leaks
    URL.revokeObjectURL(this.imagePreviews[index]);

    this.selectedFiles.splice(index, 1);
    this.imagePreviews.splice(index, 1);

    this.createPlaceForm.patchValue({ picsUrl: this.selectedFiles });
    this.createPlaceForm.get('picsUrl')?.updateValueAndValidity();
  }

  public trackByIndex(index: number): number {
    return index;
  }

  ngOnDestroy(): void {
    // Limpiar todos los object URLs para evitar memory leaks
    this.imagePreviews.forEach(preview => URL.revokeObjectURL(preview));
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

