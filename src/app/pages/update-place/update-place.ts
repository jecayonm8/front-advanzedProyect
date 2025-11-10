import { Component, OnInit, AfterViewInit } from '@angular/core'
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { PlacesService } from '../../services/places-service';
import { MapService } from '../../services/map-service';
import { AccommodationDTO, UpdateAccommodationDTO, Amenities } from '../../models/place-dto';
import Swal from 'sweetalert2';

@Component ({
    selector: 'app-update-place',
    imports: [ReactiveFormsModule],
    templateUrl: './update-place.html',
    styleUrl: './update-place.css'
})

export class UpdatePlace implements OnInit, AfterViewInit {

    cities: string[];
    accommodationTypes: string[];
    amenitiesOptions: { label: string; value: string }[];
    updatePlaceForm!: FormGroup;
    placeId: string | null = null;

    constructor(
        private formBuilder: FormBuilder,
        private placesService: PlacesService,
        private mapService: MapService,
        private route: ActivatedRoute,
        private router: Router
    ){
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
        this.route.queryParams.subscribe(params => {
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
            this.updatePlaceForm.get('location')?.setValue({
                latitude: marker.lat,
                longitude: marker.lng,
            });
        });
    }

    private loadPlaceData(id: string): void {
        const place = this.placesService.getAllSync().find(p => p.id === id);
        if (place) {
            // Para desarrollo, usamos datos mock ya que no tenemos todos los campos en AccommodationDTO
            this.updatePlaceForm.patchValue({
                title: place.title,
                price: place.price,
                city: place.city,
                description: 'Descripción del alojamiento', // Mock data
                capacity: 4, // Mock data
                country: 'Colombia', // Mock data
                department: 'Cundinamarca', // Mock data
                postalCode: '110111', // Mock data
                accommodationType: 'APARTMENT', // Mock data
                location: {
                    latitude: place.latitude,
                    longitude: place.longitude
                }
            });
        }
    }

    private createForm(){
        this.updatePlaceForm = this.formBuilder.group({
            title: ['', [Validators.required, Validators.maxLength(25), Validators.minLength(5)]],
            description: ['', [Validators.required, Validators.maxLength(500), Validators.minLength(20)]],
            capacity: ['', [Validators.required, Validators.pattern(/^[0-9]+$/), Validators.min(1), Validators.max(60)]],
            price: ['', [Validators.required, Validators.pattern(/^[0-9]+$/),Validators.min(1)]],
            country: ['', [Validators.required]],
            department: ['', [Validators.required]],
            city: ['', [Validators.required]],
            neighborhood: [''],
            street: [''],
            postalCode: ['', [Validators.required, Validators.pattern(/^[0-9A-Za-z]{4,10}$/)]],
            picsUrl: [[], [Validators.required]],
            amenities: [[], [Validators.required]],
            accommodationType: ["", Validators.required],
            location: [null, [Validators.required]]
        });
    }

    public updatePlace(){
        if (this.updatePlaceForm.valid && this.placeId) {
            const formValue = this.updatePlaceForm.value;
            const updateData: UpdateAccommodationDTO = {
                title: formValue.title,
                description: formValue.description,
                capacity: formValue.capacity,
                price: formValue.price,
                country: formValue.country,
                department: formValue.department,
                city: formValue.city,
                neighborhood: formValue.neighborhood,
                street: formValue.street,
                postalCode: formValue.postalCode,
                picsUrl: formValue.picsUrl,
                amenities: formValue.amenities,
                accommodationType: formValue.accommodationType,
                latitude: formValue.location.latitude,
                longitude: formValue.location.longitude
            };

            this.placesService.update(this.placeId, updateData).subscribe({
                next: () => {
                    Swal.fire({
                        title: "¡Éxito!",
                        text: "Se ha actualizado el alojamiento.",
                        icon: "success",
                        timer: 2000,
                        showConfirmButton: false
                    }).then(() => {
                        this.router.navigate(['/my-places']);
                    });
                },
                error: (error) => {
                    console.error('Error al actualizar alojamiento:', error);
                    Swal.fire("Error", "Ocurrió un error al actualizar el alojamiento. Inténtalo de nuevo.", "error");
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
            this.updatePlaceForm.patchValue({ picsUrl: files });
            this.updatePlaceForm.get('picsUrl')?.updateValueAndValidity();
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
}