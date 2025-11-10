import { Component, OnInit } from '@angular/core'
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { PlacesService } from '../../services/places-service';
import { AccommodationDTO } from '../../models/place-dto';

@Component ({
    selector: 'app-update-place',
    imports: [ReactiveFormsModule],
    templateUrl: './update-place.html',
    styleUrl: './update-place.css'
})

export class UpdatePlace implements OnInit {

    types: String[];
    updatePlaceForm!: FormGroup;
    placeId: string | null = null;

    constructor(
        private formBuilder: FormBuilder,
        private placesService: PlacesService,
        private route: ActivatedRoute,
        private router: Router
    ){
        this.createForm();
        this.types = ['HOUSE', 'APARTMENT', 'FARM'];
    }

    ngOnInit(): void {
        this.route.queryParams.subscribe(params => {
            this.placeId = params['id'] || null;
            if (this.placeId) {
                this.loadPlaceData(this.placeId);
            }
        });
    }

    private loadPlaceData(id: string): void {
        const place = this.placesService.getAllSync().find(p => p.id === id);
        if (place) {
            this.updatePlaceForm.patchValue({
                title: place.title,
                price: place.price,
                city: place.city
                // Agregar otros campos según sea necesario
            });
        }
    }

    private createForm(){
        this.updatePlaceForm = this.formBuilder.group({

            title: ['', [Validators.required, Validators.maxLength(25), Validators.minLength(5)]],
            description: ['', [Validators.required, Validators.maxLength(500), Validators.minLength(20)]],
            capacity: ['', [Validators.required, Validators.pattern(/^[0-9]+$/), Validators.min(1)]],
            price: ['', [Validators.required, Validators.pattern(/^[0-9]+$/),Validators.min(1)]],
            country: ['', [Validators.required]],
            department: ['', [Validators.required]],
            city: ['', [Validators.required]],
            neighborhood: [''],
            postalCode: ['', [Validators.required]],
            picsUrl: [[], [Validators.required]],
            amenities: [[], []],
            accommodationType: ["", Validators.required]
        })

    }

    public updatePlace(){
        if (this.updatePlaceForm.valid && this.placeId) {
            const formValue = this.updatePlaceForm.value;
            this.placesService.update(this.placeId, {
                title: formValue.title,
                price: formValue.price,
                city: formValue.city
                // Agregar otros campos según sea necesario
            }).subscribe({
                next: () => {
                    this.router.navigate(['/my-places']);
                },
                error: (error) => {
                    console.error('Error al actualizar alojamiento:', error);
                    alert('Error al actualizar el alojamiento');
                }
            });
        }
    }

    public onFileChange(event: Event) {
    const input = event.target as HTMLInputElement;

    if (input.files && input.files.length > 0) {
        const files = Array.from(input.files);
        this.updatePlaceForm.patchValue({ pics_url : files });
    }
}
}