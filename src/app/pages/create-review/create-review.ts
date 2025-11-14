
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { CommentService } from '../../services/comment-service';
import { CreateCommentDTO } from '../../models/place-dto';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-create-review',
  imports: [ReactiveFormsModule],
  templateUrl: './create-review.html',
  styleUrl: './create-review.css'
})
export class CreateReview implements OnInit {

  reviewForm!: FormGroup;
  bookingId: string = '';

  constructor(
    private formBuilder: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private commentService: CommentService
  ) {
    this.createForm();
  }

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      this.bookingId = params['bookingId'];
      if (this.bookingId) {
        this.reviewForm.patchValue({ bookingId: this.bookingId });
      }
    });
  }

  private createForm() {
    this.reviewForm = this.formBuilder.group({
      comment: ['', [Validators.required, Validators.minLength(20), Validators.maxLength(1000)]],
      rating: [5, [Validators.required, Validators.min(1), Validators.max(5)]],
      bookingId: ['', [Validators.required]]
    });
  }

  public createReview() {
    if (this.reviewForm.invalid) {
      this.reviewForm.markAllAsTouched();
      return;
    }

    const formValue = this.reviewForm.value;

    const commentData: CreateCommentDTO = {
      comment: formValue.comment,
      rating: formValue.rating,
      bookingId: formValue.bookingId
    };

    this.commentService.createComment(commentData).subscribe({
      next: () => {
        Swal.fire({
          title: "¡Éxito!",
          text: "Comentario creado exitosamente.",
          icon: "success",
          timer: 2000,
          showConfirmButton: false
        }).then(() => {
          this.router.navigate(['/bookings']);
        });
      },
      error: (error) => {
        console.error('Error creando comentario:', error);
        let errorMessage = "No se pudo crear el comentario. Inténtalo de nuevo.";
        if (error.error?.message) {
          errorMessage = error.error.message;
        }
        Swal.fire("Error", errorMessage, "error");
      }
    });
  }
}