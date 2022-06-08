import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppComponent } from './app.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import {AuthService} from './services/auth.service';
import {environment} from '../environments/environment';
import {JwtModule} from '@auth0/angular-jwt';
import {LoginFailedComponent} from './components/accounts/login-failed/login-failed.component';
import {RequireLoginComponent} from './components/accounts/require-login/require-login.component';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatCardModule } from '@angular/material/card';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatNativeDateModule } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatListModule } from '@angular/material/list';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatSortModule } from '@angular/material/sort';
import { MatTableModule } from '@angular/material/table';
import { MatToolbarModule } from '@angular/material/toolbar';
import {AppRoutingModule} from './app-routing.module';
import {LoginService} from './services/login.service';
import {HttpClientModule} from '@angular/common/http';
import {FlexModule} from '@angular/flex-layout';
import { SidebarComponent } from './components/sidebar/sidebar.component';
import { NotFoundComponent } from './components/not-found/not-found.component';
import { ObjectTypesComponent } from './components/object-types/object-types.component';
import { CreateObjectTypeComponent } from './components/object-types/create-object-type/create-object-type.component';
import { CreateExternalLoanComponent } from './components/external-loans/create-external-loan/create-external-loan.component';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import { ShowObjectTypeComponent } from './components/object-types/show-object-type/show-object-type.component';
import { SelectLoanComponent } from './components/selectors/select-loan/select-loan.component';
import { SelectStorageComponent } from './components/selectors/select-storage/select-storage.component';
import { ObjectComponent } from './components/object-types/object/object.component';
import { SelectUserComponent } from './components/selectors/select-user/select-user.component';
import { StorageLocationsComponent } from './components/storage-locations/storage-locations.component';
import { CreateStorageLocationComponent } from './components/storage-locations/create-storage-location/create-storage-location.component';
import { ShowStorageLocationComponent } from './components/storage-locations/show-storage-location/show-storage-location.component';
import { ExternalLoansComponent } from './components/external-loans/external-loans.component';
import { SelectLenderComponent } from './components/selectors/select-lender/select-lender.component';
import { SelectDatetimeComponent } from './components/selectors/select-datetime/select-datetime.component';
import { CreateGuestComponent } from './components/users/create-guest/create-guest.component';
import { ViewExternalLoanComponent } from './components/external-loans/view-external-loan/view-external-loan.component';
import { QuickItemCreateComponent } from './components/quickboxes/quick-item-create/quick-item-create.component';
import { QuickmoveComponent } from './components/quickboxes/quickmove/quickmove.component';
import { ReturnsComponent } from './components/returns/returns.component';
import { TidyingComponent } from './components/tidying/tidying.component';
import { HomepageComponent } from './components/homepage/homepage.component';
import { SelectObjectComponent } from './components/selectors/select-object/select-object.component';
import { QuickChangestateComponent } from './components/quickboxes/quick-changestate/quick-changestate.component';
import {SignaturePadModule} from 'angular2-signaturepad';
import { SigningAreaComponent } from './components/selectors/signing-area/signing-area.component';
import { SignatureModalComponent } from './components/selectors/signature-modal/signature-modal.component';
import { UpdateObjectComponent } from './components/object-types/update-object/update-object.component';
import { UserLogsComponent } from './components/user-logs/user-logs.component';
import { ObjectsListComponent } from './components/object-types/objects-list/objects-list.component';
import { AllObjectsOutComponent } from './components/all-objects-out/all-objects-out.component';
import { SelectObjectTypeComponent } from './components/selectors/select-object-type/select-object-type.component';
import {EventSelectorComponent} from './components/selectors/event-selector/event-selector.component';
import {GuestsComponent} from './components/users/guests.component';
import {ViewUserComponent} from './components/users/view-user/view-user.component';
import {MatTooltipModule} from '@angular/material/tooltip';
import { StatusLabelComponent } from './components/utils/status-label/status-label.component';
import { LocationTreeComponent } from './components/utils/location-tree/location-tree.component';
import { MatNestedTreeNode, MatTreeModule} from '@angular/material/tree';
import {MatSliderModule} from '@angular/material/slider';
import {AbstractSelectorComponent} from './components/selectors/abstract-selector/abstract-selector.component';
import { ObjectTypeTreeComponent } from './components/utils/object-type-tree/object-type-tree.component';
import { AllObjectsComponent } from './components/object-types/all-objects/all-objects.component';
import {MatPaginatorModule} from '@angular/material/paginator';

export function tokenGetter() {
  return localStorage.getItem('id_token');
}

@NgModule({
  declarations: [
    AppComponent,
    LoginFailedComponent,
    RequireLoginComponent,
    SidebarComponent,
    NotFoundComponent,
    ObjectTypesComponent,
    CreateObjectTypeComponent,
    CreateExternalLoanComponent,
    ShowObjectTypeComponent,
    SelectLoanComponent,
    SelectStorageComponent,
    ObjectComponent,
    SelectUserComponent,
    StorageLocationsComponent,
    CreateStorageLocationComponent,
    ShowStorageLocationComponent,
    ExternalLoansComponent,
    SelectLenderComponent,
    SelectDatetimeComponent,
    CreateGuestComponent,
    ViewExternalLoanComponent,
    QuickItemCreateComponent,
    QuickmoveComponent,
    ReturnsComponent,
    TidyingComponent,
    HomepageComponent,
    SelectObjectComponent,
    QuickChangestateComponent,
    SigningAreaComponent,
    SignatureModalComponent,
    UpdateObjectComponent,
    UserLogsComponent,
    ObjectsListComponent,
    AllObjectsOutComponent,
    SelectObjectTypeComponent,
    EventSelectorComponent,
    GuestsComponent,
    ViewUserComponent,
    StatusLabelComponent,
    LocationTreeComponent,
    ObjectTypeTreeComponent,
    AllObjectsComponent
  ],
  entryComponents: [
    CreateStorageLocationComponent,
    CreateGuestComponent,
    SignatureModalComponent,
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    MatCardModule,
    AppRoutingModule,
    MatProgressBarModule,
    HttpClientModule,
    MatIconModule,
    MatToolbarModule,
    MatButtonModule,
    MatNativeDateModule,
    MatMenuModule,

    JwtModule.forRoot({
      config: {
        tokenGetter,
        allowedDomains: [environment.apidomain]
      }
    }),
    FlexModule,
    MatSidenavModule,
    MatListModule,
    MatInputModule,
    MatAutocompleteModule,
    MatSelectModule,
    FormsModule,
    MatTableModule,
    MatProgressSpinnerModule,
    MatDialogModule,
    MatCheckboxModule,
    MatDatepickerModule,
    SignaturePadModule,
    MatButtonToggleModule,
    MatSlideToggleModule,
    MatSortModule,
    ReactiveFormsModule,
    MatTooltipModule,
    MatTreeModule,
    MatSliderModule,
    MatPaginatorModule

  ],
  providers: [
    AuthService,
    LoginService
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
