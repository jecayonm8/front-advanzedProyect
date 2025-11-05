import { Routes } from '@angular/router';
import { Home } from './pages/home/home';
import { Login } from './pages/login/login';
import { Register } from './pages/register/register';
import { CreatePlace } from './pages/create-place/create-place';
import { CreateBooking } from './pages/create-booking/create-booking';
import { CreateReview } from './pages/create-review/create-review';
import { CreateComplaint } from './pages/create-complaint/create-complaint';
<<<<<<< HEAD
import { MyPlaces } from './pages/my-places/my-places';
import { Bookings } from './pages/bookings/bookings';
=======
import { UpdateProfile } from './pages/update-profile/update-profile';
>>>>>>> main

export const routes: Routes = [
  { path: '', component: Home },
  { path: 'login', component: Login },
  { path: 'register', component: Register },
  { path: 'create-place', component: CreatePlace },
  { path: 'create-booking', component: CreateBooking },
  { path: 'create-review', component: CreateReview },
  { path: 'create-complaint', component: CreateComplaint },
<<<<<<< HEAD
  { path: 'my-places', component: MyPlaces },
  { path: 'bookings', component: Bookings },
=======
  { path: 'update-profile', component: UpdateProfile },
>>>>>>> main
  { path: "**", pathMatch: "full", redirectTo: "" }

];
