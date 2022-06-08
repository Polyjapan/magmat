import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {LoginFailedComponent} from './components/accounts/login-failed/login-failed.component';
import {RequireLoginComponent} from './components/accounts/require-login/require-login.component';
import {PermissionAuthGuard} from './services/permission-auth-guard.service';
import {NotFoundComponent} from './components/not-found/not-found.component';
import {ObjectTypesComponent} from './components/object-types/object-types.component';
import {CreateObjectTypeComponent} from './components/object-types/create-object-type/create-object-type.component';
import {CreateExternalLoanComponent} from './components/external-loans/create-external-loan/create-external-loan.component';
import {ShowObjectTypeComponent} from './components/object-types/show-object-type/show-object-type.component';
import {ObjectComponent} from './components/object-types/object/object.component';
import {StorageLocationsComponent} from './components/storage-locations/storage-locations.component';
import {ShowStorageLocationComponent} from './components/storage-locations/show-storage-location/show-storage-location.component';
import {ExternalLoansComponent} from './components/external-loans/external-loans.component';
import {ViewExternalLoanComponent} from './components/external-loans/view-external-loan/view-external-loan.component';
import {ReturnsComponent} from './components/returns/returns.component';
import {TidyingComponent} from './components/tidying/tidying.component';
import {HomepageComponent} from './components/homepage/homepage.component';
import {UpdateObjectComponent} from './components/object-types/update-object/update-object.component';
import {UserLogsComponent} from './components/user-logs/user-logs.component';
import {AllObjectsOutComponent} from './components/all-objects-out/all-objects-out.component';
import {GuestsComponent} from './components/users/guests.component';
import {ViewUserComponent} from './components/users/view-user/view-user.component';
import {AllObjectsComponent} from './components/object-types/all-objects/all-objects.component';


const routes: Routes = [
  {path: 'require-login', component: RequireLoginComponent},
  {path: 'login-failed', component: LoginFailedComponent},
  {path: 'login-failed/:details', component: LoginFailedComponent},

  // Protected paths

  {path: '', component: HomepageComponent, canActivate: [PermissionAuthGuard]},
  {path: 'storages', component: StorageLocationsComponent, canActivate: [PermissionAuthGuard]},
  {path: 'storages/:id', component: ShowStorageLocationComponent, canActivate: [PermissionAuthGuard]},
  {path: 'storages/list/:room', component: ShowStorageLocationComponent, canActivate: [PermissionAuthGuard]},
  {path: 'storages/list/:room/:space', component: ShowStorageLocationComponent, canActivate: [PermissionAuthGuard]},

  {path: 'object-types', component: ObjectTypesComponent, canActivate: [PermissionAuthGuard]},
  {path: 'object-types/create', component: CreateObjectTypeComponent, canActivate: [PermissionAuthGuard]},
  {path: 'object-types/:typeId', component: ShowObjectTypeComponent, canActivate: [PermissionAuthGuard]},
  {path: 'object-types/edit/:typeId', component: CreateObjectTypeComponent, canActivate: [PermissionAuthGuard]},

  {path: 'objects', component: AllObjectsComponent, canActivate: [PermissionAuthGuard]},
  {path: 'objects/:id', component: ObjectComponent, canActivate: [PermissionAuthGuard]},
  {path: 'objects/update/:objectId', component: UpdateObjectComponent, canActivate: [PermissionAuthGuard]},

  {path: 'tidying', component: TidyingComponent, canActivate: [PermissionAuthGuard]},
  {path: 'returns', component: ReturnsComponent, canActivate: [PermissionAuthGuard]},

  {path: 'user-logs', component: UserLogsComponent, canActivate: [PermissionAuthGuard]},
  {path: 'objects-out', component: AllObjectsOutComponent, canActivate: [PermissionAuthGuard]},

  {path: 'external-loans', component: ExternalLoansComponent, canActivate: [PermissionAuthGuard]},
  {path: 'external-loans/create', component: CreateExternalLoanComponent, canActivate: [PermissionAuthGuard]},
  {path: 'external-loans/:id', component: ViewExternalLoanComponent, canActivate: [PermissionAuthGuard]},

  {path: 'guests', component: GuestsComponent, canActivate: [PermissionAuthGuard]},
  {path: 'guests/:id', component: ViewUserComponent, data: {isGuest: true}, canActivate: [PermissionAuthGuard]},
  {path: 'users/:id', component: ViewUserComponent, canActivate: [PermissionAuthGuard]},

  {
    path: '**',
    canActivate: [PermissionAuthGuard],
    component: NotFoundComponent
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes, { relativeLinkResolution: 'legacy' })],
  exports: [RouterModule]
})
export class AppRoutingModule {
}

