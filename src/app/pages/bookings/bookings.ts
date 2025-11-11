import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { BookingDTO } from '../../models/booking-dto';
import { BookingService } from '../../services/booking-service';
import { TokenService } from '../../services/token-service';

@Component({
  selector: 'app-bookings',
  imports: [CommonModule, RouterLink],
  templateUrl: './bookings.html',
  styleUrl: './bookings.css',
})
export class Bookings {

  bookings: BookingDTO[] = [];

  constructor(private bookingService: BookingService, private tokenService: TokenService) {
    const userId = this.tokenService.getUserId();
    if (userId) {
      this.bookingService.getUserBookings(userId).subscribe({
        next: (data) => this.bookings = data,
        error: (err) => console.error('Error loading bookings:', err)
      });
    }
  }

}
