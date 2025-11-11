import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { PlacesService } from '../../services/places-service';
import { StatsDTO, StatsDateDTO } from '../../models/place-dto';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-place-stats',
  imports: [ReactiveFormsModule, CommonModule, RouterLink],
  templateUrl: './place-stats.html',
  styleUrl: './place-stats.css'
})
export class PlaceStats implements OnInit {

  statsForm!: FormGroup;
  accommodationId: string | null = null;
  stats: StatsDTO | null = null;
  isLoading = false;

  constructor(
    private formBuilder: FormBuilder,
    private placesService: PlacesService,
    private route: ActivatedRoute,
    private router: Router
  ) {
    this.createForm();
  }

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      this.accommodationId = params['id'] || null;
      if (this.accommodationId) {
        this.loadStats();
      } else {
        this.router.navigate(['/my-places']);
      }
    });
  }

  private createForm(): void {
    this.statsForm = this.formBuilder.group({
      startDate: [''],
      endDate: ['']
    });
  }

  public loadStats(): void {
    if (!this.accommodationId) return;

    this.isLoading = true;
    const formValue = this.statsForm.value;

    // Validar que si se pone una fecha, se pongan ambas
    let startDate: string | null = null;
    let endDate: string | null = null;
    if (formValue.startDate || formValue.endDate) {
      if (formValue.startDate && formValue.endDate) {
        startDate = new Date(formValue.startDate).toISOString();
        endDate = new Date(formValue.endDate).toISOString();
      } else {
        Swal.fire("Error", "Debes seleccionar ambas fechas o ninguna.", "error");
        this.isLoading = false;
        return;
      }
    }

    const dateFilter: StatsDateDTO = {};
    if (startDate) dateFilter.startDate = startDate;
    if (endDate) dateFilter.endDate = endDate;

    this.placesService.getAccommodationStats(this.accommodationId, dateFilter).subscribe({
      next: (stats) => {
        this.stats = stats;
        this.isLoading = false;
      },
      error: (error: any) => {
        console.error('Error loading stats:', error);
        Swal.fire("Error", "No se pudieron cargar las estadísticas.", "error");
        this.isLoading = false;
      }
    });
  }

  public resetFilters(): void {
    this.statsForm.reset();
    this.loadStats();
  }
}