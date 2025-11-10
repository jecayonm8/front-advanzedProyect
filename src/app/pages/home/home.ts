import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { PlacesService } from '../../services/places-service';
import { AccommodationDTO } from '../../models/place-dto';

@Component({
  selector: 'app-home',
  imports: [CommonModule],
  templateUrl: './home.html',
  styleUrls: ['./home.css']
})
export class Home implements OnInit {
  places: AccommodationDTO[] = [];
  currentIndex = 0;

  constructor(private placesService: PlacesService) {}

  ngOnInit(): void {
    this.placesService.getAll().subscribe(places => {
      this.places = places;
      this.currentIndex = this.places.length ? 0 : -1;
    });
  }

  trackById(_: number, item: AccommodationDTO) {
    return item.title; // si tienes id, usa item.id
  }

  prev() {
    if (!this.places?.length) return;
    this.currentIndex = (this.currentIndex - 1 + this.places.length) % this.places.length;
  }

  next() {
    if (!this.places?.length) return;
    this.currentIndex = (this.currentIndex + 1) % this.places.length;
  }

  goTo(index: number) {
    if (!this.places?.length) return;
    this.currentIndex = index;
  }
}
