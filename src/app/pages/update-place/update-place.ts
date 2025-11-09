import { Component } from '@angular/core'
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';

@Component ({
    selector: 'app-update-place',
    imports: [ReactiveFormsModule],
    templateUrl: './update-place.html',
    styleUrl: './update-place.css'
})

export class UpdatePlace{

    types: String[];
    updatePlaceForm!: FormGroup

    constructor(private formBuilder: FormBuilder){
        this.createForm();
        this.types = ['HOUSE', 'APARTMENT', 'FARM'];
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
        console.log(this.updatePlaceForm.value)
    }

    public onFileChange(event: Event) {
    const input = event.target as HTMLInputElement;

    if (input.files && input.files.length > 0) {
        const files = Array.from(input.files);
        this.updatePlaceForm.patchValue({ pics_url : files });
    }
}
}