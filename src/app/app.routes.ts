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
import { EditProfile } from './pages/edit-profile/edit-profile';
import { ForgotPassword } from './pages/forgot-password/forgot-password';
import { Forbidden } from './pages/forbidden/forbidden';
import { LoginGuard } from './guards/login.guard';
import { RoleGuard } from './guards/role.guard';

export const routes: Routes = [
  { path: '', component: Home },
  { path: 'login', component: Login },
  { path: 'register', component: Register },
  { path: 'forbidden', component: Forbidden },
  { path: 'create-place', component: CreatePlace, canActivate: [LoginGuard] },
  { path: 'create-booking', component: CreateBooking, canActivate: [LoginGuard] },
  { path: 'create-booking/:id', component: CreateBooking, canActivate: [LoginGuard] },
  { path: 'create-review', component: CreateReview, canActivate: [LoginGuard] },
  { path: 'create-complaint', component: CreateComplaint, canActivate: [LoginGuard] },
  { path: 'my-places', component: MyPlaces, canActivate: [LoginGuard] },
  { path: 'favorites', component: Favorites, canActivate: [LoginGuard] },
  { path: 'bookings', component: Bookings, canActivate: [LoginGuard] },
  { path: 'update-profile', component: UpdateProfile, canActivate: [LoginGuard] },
  { path: 'update-place', component: UpdatePlace, canActivate: [LoginGuard] },
  { path: 'edit-place/:id', component: UpdatePlace, canActivate: [LoginGuard] },
  { path: 'place-stats/:id', component: PlaceStats, canActivate: [LoginGuard] },
  { path: 'change-password', component: ChangePassword, canActivate: [LoginGuard] },
  { path: 'edit-profile', component: EditProfile, canActivate: [LoginGuard] },
  { path: 'forgot-password', component: ForgotPassword },
  { path: 'place/:id', component: DetailPlace },
  { path: 'place/:id/bookings', component: AccommodationBookings, canActivate: [LoginGuard] },
  { path: "**", pathMatch: "full", redirectTo: "" }


];
