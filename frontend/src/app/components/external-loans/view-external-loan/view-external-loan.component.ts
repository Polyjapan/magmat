import {Component, OnInit, ViewChild} from '@angular/core';
import {CompleteExternalLoan, LoanState, loanStateToText} from '../../../data/external-loan';
import {ActivatedRoute} from '@angular/router';
import {LoansService} from '../../../services/loans.service';
import {CompleteObject, ObjectStatus} from '../../../data/object';
import {ObjectsService} from '../../../services/objects.service';
import {ObjectType} from '../../../data/object-type';
import {StorageLocationsService} from '../../../services/storage-locations.service';
import Swal from 'sweetalert2';
import {SelectObjectTypeComponent} from '../../selectors/select-object-type/select-object-type.component';
import {Observable} from 'rxjs';
import {ObjectTypesService} from '../../../services/object-types.service';

@Component({
  selector: 'app-view-external-loan',
  templateUrl: './view-external-loan.component.html',
  styleUrls: ['./view-external-loan.component.css']
})
export class ViewExternalLoanComponent implements OnInit {

  id: number;
  loan$: Observable<CompleteExternalLoan>;
  loanStateToText = loanStateToText;
  items: CompleteObject[]; // For objects listing
  createdType: ObjectType;
  creating: boolean;
  changingState = false;
  linkTypesToLoan = false;
  selectedType: ObjectType;
  @ViewChild(SelectObjectTypeComponent) selectObjectTypeComponent: SelectObjectTypeComponent;

  constructor(private ar: ActivatedRoute, private ls: LoansService, private os: ObjectsService, private ots: ObjectTypesService, private sls: StorageLocationsService) {
  }

  isPickedUp(loan: CompleteExternalLoan) {
    return loan.externalLoan.status !== LoanState.AWAITING_PICKUP;
  }

  isReturned(loan: CompleteExternalLoan) {
    return loan.externalLoan.status === LoanState.RETURNED;
  }

  get canGiveBack() {
    if (this.items) {
      return !this.items.map(it => it.object.status).find(state => state === ObjectStatus.RESTING || state === ObjectStatus.OUT);
    } else {
      return false;
    }
  }

  resetCreatedType() {
    this.createdType = new ObjectType();
  }

  ngOnInit() {
    this.ar.paramMap.subscribe(map => {
      this.id = Number.parseInt(map.get('id'), 10);
      this.loan$ = this.ls.getLoan(this.id);
    });

    this.resetCreatedType();
  }

  refreshObjects() {
    this.os.getObjectsForLoan(this.id).subscribe(items => this.items = items);
  }

  refreshLoan() {
    this.ls.forceRefreshLoans();
    // this.ls.getLoanDirect(this.id).subscribe(l => this.loan = l);
  }

  refresh() {
    this.refreshLoan();
    this.refreshTypes();
    this.refreshObjects();
  }

  dateFormat(date) {
    if (typeof date === 'string') {
      return new Date(Date.parse(date)).toLocaleString();
    } else {
      return date.toLocaleString();
    }
  }

  closeLoan() {
    if (this.canGiveBack) {
      this.changeState(LoanState.RETURNED);
    }
  }

  takeLoan() {
    this.changeState(LoanState.AWAITING_RETURN);
  }

  changeState(targetState: LoanState) {
    if (this.changingState) {
      return;
    }
    this.changingState = true;

    Swal.fire({
      titleText: 'Confirmer le changement d\'état',
      html: 'Voulez vous confirmer le passage du prêt à l\'état <b>' + loanStateToText(targetState) + '</b> ?',
      icon: 'question',
      showConfirmButton: true,
      showCancelButton: true,
      confirmButtonText: 'Confirmer',
      cancelButtonText: 'Annuler'
    }).then(data => {
      if (data.value) {
        this.ls
          .changeState(this.id, targetState)
          .subscribe(succ => {
            Swal.fire('Changement réussi', undefined, 'success');
            this.refreshLoan();
            this.changingState = false;
          }, err => {
            this.changingState = false;
            Swal.fire('Oups', 'Une erreur s\'est produite pendant le changement d\'état. Réessayez plus tard', 'error');
          });
      } else {
        this.changingState = false;
      }
    }, err => this.changingState = false);
  }

  create() {
    if (this.creating) {
      return;
    }

    if (this.linkTypesToLoan) {
      this.createdType.partOfLoan = this.id;
    }

    this.creating = true;
    this.ots.createOrUpdateObjectType(this.createdType).subscribe(id => {
      Swal.fire({title: 'Objet ajouté', icon: 'success', timer: 3000, timerProgressBar: true}).then(() => {
        this.creating = false;
        this.refreshTypes();
        this.resetCreatedType();
      });
    }, () => {
      this.creating = false;
      Swal.fire('Erreur', 'Une erreur s\'est produite pendant l\'envoi. Merci de réessayer.', 'error');
    });
  }

  private refreshTypes() {
    if (this.selectObjectTypeComponent) {
      this.selectObjectTypeComponent.refreshTypes();
    }
  }
}
