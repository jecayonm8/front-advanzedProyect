import { Component, OnInit, AfterViewInit, OnDestroy } from '@angular/core'
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { PlacesService } from '../../services/places-service';
import { MapService } from '../../services/map-service';
import { ImageService } from '../../services/image-service';
import { AccommodationDTO, UpdateAccommodationDTO, Amenities, GetForUpdateDTO } from '../../models/place-dto';
import { forkJoin } from 'rxjs';
import { CommonModule } from '@angular/common';
import Swal from 'sweetalert2';

@Component ({
    selector: 'app-update-place',
    imports: [ReactiveFormsModule, CommonModule],
    templateUrl: './update-place.html',
    styleUrl: './update-place.css'
})

export class UpdatePlace implements OnInit, AfterViewInit {

    cities: string[];
    accommodationTypes: string[];
    amenitiesOptions: { label: string; value: string }[] = [];
    existingImages: string[] = [];
    selectedFiles: File[] = [];
    imagePreviews: string[] = [];

    updatePlaceForm!: FormGroup;
    placeId: string | null = null;
    private originalPicsUrl: string[] = [];

    get allImages(): {src: string, type: 'existing' | 'new', originalIndex: number}[] {
        const existing = this.existingImages.map((src, i) => ({src, type: 'existing' as const, originalIndex: i}));
        const newOnes = this.imagePreviews.map((src, i) => ({src, type: 'new' as const, originalIndex: i}));
        return [...existing, ...newOnes];
    }

    constructor(
        private formBuilder: FormBuilder,
        private placesService: PlacesService,
        private mapService: MapService,
        private imageService: ImageService,
        private route: ActivatedRoute,
        private router: Router
    ){
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
        this.route.params.subscribe(params => {
            this.placeId = params['id'] || null;
            if (this.placeId) {
                this.loadPlaceData(this.placeId);
            }
        });
        // Inicializa el mapa con la configuración predeterminada
        this.mapService.create();
    }

    ngAfterViewInit(): void {
        // Se suscribe al evento de agregar marcador y actualiza el formulario después de que la vista esté inicializada
        this.mapService.addMarker().subscribe((marker) => {
            this.updatePlaceForm.get('latitude')?.setValue(marker.lat);
            this.updatePlaceForm.get('longitude')?.setValue(marker.lng);
        });
    }

    private loadPlaceData(id: string): void {
        this.placesService.getForUpdate(id).subscribe({
            next: (data: GetForUpdateDTO) => {
                this.originalPicsUrl = data.pics_url || [];
                this.existingImages = [...this.originalPicsUrl];
                this.updatePlaceForm.patchValue({
                    title: data.title,
                    description: data.description,
                    capacity: data.capacity,
                    price: data.price,
                    country: data.country,
                    department: data.department,
                    city: data.city,
                    neighborhood: data.neighborhood,
                    street: data.street,
                    postalCode: data.postalCode,
                    picsUrl: data.pics_url,
                    amenities: data.amenities,
                    accommodationType: data.accommodationType,
                    latitude: data.latitude,
                    longitude: data.longitude
                });

                // Centrar el mapa en la ubicación del alojamiento y colocar marcador
                this.mapService.setMarkerAtLocation(data.latitude, data.longitude);
            },
            error: (error) => {
                console.error('Error al cargar datos del alojamiento:', error);
                Swal.fire({
                    title: "Error",
                    text: "No se pudo cargar la información del alojamiento. Verifica que el alojamiento exista.",
                    icon: "error",
                    confirmButtonText: "Aceptar"
                }).then(() => {
                    this.router.navigate(['/my-places']);
                });
            }
        });
    }

    private createForm(){
        this.updatePlaceForm = this.formBuilder.group({
            title: ['', [Validators.required, Validators.maxLength(25), Validators.minLength(5)]],
            description: ['', [Validators.required, Validators.maxLength(500), Validators.minLength(20)]],
            capacity: ['', [Validators.required, Validators.pattern(/^[0-9]+$/), Validators.min(1), Validators.max(60)]],
            price: ['', [Validators.required, Validators.pattern(/^[0-9]+$/),Validators.min(1)]],
            accommodationType: ['', [Validators.required]],
            country: ['Colombia', [Validators.required]],
            department: ['', [Validators.required]],
            city: ['', [Validators.required]],
            neighborhood: [''],
            street: [''],
            postalCode: ['', [Validators.required, Validators.pattern(/^[0-9A-Za-z]{4,10}$/)]],
            latitude: ['', [Validators.required]],
            longitude: ['', [Validators.required]],
            amenities: [[], [Validators.required]],
            picsUrl: [[]]
        });
    }

    public updatePlace(){
        if (this.updatePlaceForm.valid && this.placeId) {
            const formValue = this.updatePlaceForm.value;

            // Validar que haya al menos 1 imagen en total (existentes + nuevas)
            const totalImages = (formValue.picsUrl?.length || 0) + this.selectedFiles.length;
            if (totalImages < 1) {
                Swal.fire("Error", "Debes mantener al menos 1 imagen del alojamiento.", "error");
                return;
            }

            if (totalImages > 10) {
                Swal.fire("Error", "No puedes tener más de 10 imágenes.", "error");
                return;
            }

            // Mostrar loading
            Swal.fire({
                title: "Actualizando alojamiento...",
                text: "Por favor espera.",
                allowOutsideClick: false,
                showConfirmButton: false,
                willOpen: () => {
                    Swal.showLoading();
                }
            });

            // Si hay nuevas imágenes, subirlas primero
            if (this.selectedFiles.length > 0) {
                const uploadObservables = this.selectedFiles.map(file => this.imageService.uploadImage(file));

                forkJoin(uploadObservables).subscribe({
                    next: (uploadResponses: any[]) => {
                        console.log('Respuestas de subida de imágenes:', uploadResponses);

                        // Extraer URLs de las respuestas
                        const newPicsUrls = uploadResponses.map((response, index) => {
                            let imageUrl = null;

                            if (response.data?.url) {
                                imageUrl = response.data.url;
                            } else if (response.url) {
                                imageUrl = response.url;
                            } else if (response.secure_url) {
                                imageUrl = response.secure_url;
                            } else if (response.data?.secure_url) {
                                imageUrl = response.data.secure_url;
                            } else if (typeof response === 'string') {
                                imageUrl = response;
                            } else if (response.message?.url) {
                                imageUrl = response.message.url;
                            } else if (response.message?.secure_url) {
                                imageUrl = response.message.secure_url;
                            }

                            return imageUrl;
                        }).filter(url => url !== null);

                        console.log('URLs nuevas extraídas:', newPicsUrls);

                        if (newPicsUrls.length !== this.selectedFiles.length) {
                            Swal.close();
                            Swal.fire("Error", "No se pudieron obtener todas las URLs de las imágenes subidas.", "error");
                            return;
                        }

                        // Combinar URLs existentes y nuevas
                        const allPicsUrls = [...(formValue.picsUrl || []), ...newPicsUrls];

                        this.performUpdate(formValue, allPicsUrls);
                    },
                    error: (error) => {
                        Swal.close();
                        console.error('Error al subir imágenes:', error);
                        Swal.fire("Error", "Ocurrió un error al subir las imágenes. Inténtalo de nuevo.", "error");
                    }
                });
            } else {
                // Enviar las imágenes actuales (pueden haber sido modificadas por eliminación)
                const picsUrls = formValue.picsUrl && Array.isArray(formValue.picsUrl) && formValue.picsUrl.length > 0 && typeof formValue.picsUrl[0] === 'string' ? formValue.picsUrl as string[] : [];
                this.performUpdate(formValue, picsUrls);
            }
        } else {
            Swal.fire("Error", "Por favor complete todos los campos requeridos.", "error");
        }
    }

    private performUpdate(formValue: any, picsUrls: string[]) {
        const updateData: UpdateAccommodationDTO = {
            title: formValue.title,
            description: formValue.description,
            capacity: parseInt(formValue.capacity),
            price: parseFloat(formValue.price),
            country: formValue.country,
            department: formValue.department,
            city: formValue.city,
            neighborhood: formValue.neighborhood || null,
            street: formValue.street || null,
            postalCode: formValue.postalCode,
            amenities: formValue.amenities || [],
            accommodationType: formValue.accommodationType,
            latitude: parseFloat(formValue.latitude),
            longitude: parseFloat(formValue.longitude),
            pics_url: picsUrls
        };

        console.log('Datos del alojamiento a actualizar:', updateData);

        this.placesService.update(this.placeId!, updateData).subscribe({
            next: () => {
                Swal.close();
                Swal.fire({
                    title: "¡Éxito!",
                    text: "Se ha actualizado el alojamiento.",
                    icon: "success",
                    timer: 2000,
                    showConfirmButton: false
                }).then(() => {
                    // Resetear arrays de imágenes nuevas
                    this.selectedFiles = [];
                    this.imagePreviews.forEach(preview => URL.revokeObjectURL(preview));
                    this.imagePreviews = [];
                    this.router.navigate(['/my-places']);
                });
            },
            error: (error) => {
                Swal.close();
                console.error('Error al actualizar alojamiento:', error);
                console.error('Detalles del error.error:', error.error);
                let errorMessage = "Ocurrió un error al actualizar el alojamiento. Inténtalo de nuevo.";

                if (error.error?.message) {
                    if (Array.isArray(error.error.message)) {
                        errorMessage = error.error.message.map((item: any) =>
                            typeof item === 'string' ? item : JSON.stringify(item)
                        ).join(', ');
                    } else if (typeof error.error.message === 'string') {
                        errorMessage = error.error.message;
                    } else {
                        errorMessage = JSON.stringify(error.error.message);
                    }
                }

                Swal.fire("Error", errorMessage, "error");
            }
        });
    }

    public onFileChange(event: Event) {
        const input = event.target as HTMLInputElement;

        if (input.files && input.files.length > 0) {
            const newFiles = Array.from(input.files);

            // Validar número de imágenes
            const totalFiles = this.selectedFiles.length + newFiles.length;
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

            // No se actualiza picsUrl en el form ya que es para URLs existentes

            // Limpiar el input para permitir seleccionar los mismos archivos nuevamente si es necesario
            input.value = '';
        }
    }

    // Este metodo mantiene sincronizado el control de formulario de amenidades
    // según el estado de cada checkbox seleccionado
    public onAmenityToggle(amenity: string, checked: boolean) {
        const amenitiesControl = this.updatePlaceForm.get('amenities');
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

    public removeImage(img: {type: 'existing' | 'new', originalIndex: number}) {
        if (img.type === 'existing') {
            this.existingImages.splice(img.originalIndex, 1);
            this.updatePlaceForm.patchValue({ picsUrl: this.existingImages });
            this.updatePlaceForm.get('picsUrl')?.updateValueAndValidity();
        } else {
            // Liberar el object URL para evitar memory leaks
            URL.revokeObjectURL(this.imagePreviews[img.originalIndex]);

            this.selectedFiles.splice(img.originalIndex, 1);
            this.imagePreviews.splice(img.originalIndex, 1);

            this.updatePlaceForm.patchValue({ picsUrl: this.selectedFiles });
            this.updatePlaceForm.get('picsUrl')?.updateValueAndValidity();
        }
    }

    public trackByIndex(index: number): number {
        return index;
    }

    ngOnDestroy(): void {
        // Limpiar todos los object URLs para evitar memory leaks
        this.imagePreviews.forEach(preview => URL.revokeObjectURL(preview));
    }
}