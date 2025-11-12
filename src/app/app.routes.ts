import { Routes } from '@angular/router';
import { Home } from './pages/home/home';
import { Login } from './pages/login/login';
import { Register } from './pages/register/register';
import { CreatePlace } from './pages/create-place/create-place';
import { CreateBooking } from './pages/create-booking/create-booking';
import { CreateReview } from './pages/create-review/create-review';
import { CreateComplaint } from './pages/create-complaint/create-complaint';
import { MyPlaces } from './pages/my-places/my-places';
import { Favorites } from './pages/favorites/favorites';
import { Bookings } from './pages/bookings/bookings';
import { UpdateProfile } from './pages/update-profile/update-profile';
import { UpdatePlace } from './pages/update-place/update-place';
import { PlaceStats } from './pages/place-stats/place-stats';
import { ChangePassword } from './pages/change-password/change-password';
import { DetailPlace } from './pages/detail-place/detail-place';
import { AccommodationBookings } from './pages/accommodation-bookings/accommodation-bookings';

export const routes: Routes = [
  { path: '', component: Home },
  { path: 'login', component: Login },
  { path: 'register', component: Register },
  { path: 'create-place', component: CreatePlace },
  { path: 'create-booking', component: CreateBooking },
  { path: 'create-booking/:id', component: CreateBooking },
  { path: 'create-review', component: CreateReview },
  { path: 'create-complaint', component: CreateComplaint },
  { path: 'my-places', component: MyPlaces },
  { path: 'favorites', component: Favorites },
  { path: 'bookings', component: Bookings },
  { path: 'update-profile', component: UpdateProfile },
  { path: 'update-place', component: UpdatePlace},
  { path: 'edit-place/:id', component: UpdatePlace },
  { path: 'place-stats/:id', component: PlaceStats },
  { path: 'change-password', component: ChangePassword},
  { path: 'place/:id', component: DetailPlace },
  { path: 'place/:id/bookings', component: AccommodationBookings },
  { path: "**", pathMatch: "full", redirectTo: "" }


];
