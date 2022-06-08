import {Component, EventEmitter, Input, OnInit, Output, ViewChild} from '@angular/core';
import Swal from 'sweetalert2';
import {CompleteObject, ObjectStatus, statusToString} from '../../../data/object';
import {UserProfile} from '../../../data/user';
import {ObjectsService} from '../../../services/objects.service';
import { MatDialog } from '@angular/material/dialog';
import {requestSignature} from '../../../services/signature';
import {storageLocationToString} from '../../../data/storage-location';
import {SelectUserComponent} from '../../selectors/select-user/select-user.component';

@Component({
  selector: 'app-quick-changestate',
  templateUrl: './quick-changestate.component.html',
  styleUrls: ['./quick-changestate.component.css']
})
export class QuickChangestateComponent implements OnInit {
  @Input() object: CompleteObject;
  @Output() update = new EventEmitter();

  @ViewChild('selectUserComponent') userSelector: SelectUserComponent;

  statusToString = statusToString;
  ObjectStatus = ObjectStatus;
  lendTo: UserProfile;
  sending = false;

  constructor(private service: ObjectsService, private dialog: MatDialog) {
  }


  declareLoaned() {
    this.changeState(ObjectStatus.OUT);
  }

  declareInStock() {
    this.changeState(ObjectStatus.IN_STOCK);
  }

  declareResting() {
    this.changeState(ObjectStatus.RESTING);
  }

  declareLost() {
    this.changeState(ObjectStatus.LOST);
  }

  ngOnInit(): void {
  }

  private changeState(targetState: ObjectStatus) {
    if (!this.lendTo) {
      return;
    }

    if (this.sending) {
      return;
    }
    this.sending = true;

    // May require signature
    if (this.object.object.requiresSignature) {
      if ((this.object.object.status === ObjectStatus.IN_STOCK || this.object.object.status === ObjectStatus.OUT) && targetState === ObjectStatus.OUT) {
        requestSignature(this.dialog, this.object.objectType.name + ' ' + this.object.object.suffix,
          sgn => this.doChangeState(targetState, sgn),
          () => this.sending = false);
      } else {
        this.doChangeState(targetState);
      }
    } else {
      this.doChangeState(targetState);
    }
  }

  private doChangeState(targetState: ObjectStatus, signature?: string) {
    const userId = this.lendTo.id;

    Swal.fire({
      titleText: 'Confirmer le changement d\'état',
      html: 'Voulez vous confirmer le passage de l\'objet à l\'état <b>' + statusToString(targetState) + '</b> pour l\'utilisateur <b>' +
        this.lendTo.details.firstName + ' ' + this.lendTo.details.lastName + '</b> ?',
      icon: 'question',
      showConfirmButton: true,
      showCancelButton: true,
      confirmButtonText: 'Confirmer',
      cancelButtonText: 'Annuler'
    }).then(data => {
      if (data.value) {
        this.service
          .changeState(this.object.object.objectId, targetState, userId, signature)
          .subscribe(succ => {
            const placeHere = targetState === ObjectStatus.IN_STOCK ? '<br>Merci de ranger l\'objet ici : <b>'
              + storageLocationToString(this.object.inconvStorageLocationObject) + '</b>' : '';

            Swal.fire({
              titleText: 'Changement réussi',
              html: 'L\'objet est désormais <b>' + statusToString(targetState) + '</b> par <b>' + this.lendTo.details.firstName + ' ' +
                this.lendTo.details.lastName + '</b>' + placeHere,
              icon: 'success'
            });
            this.userSelector.reset();
            this.sending = false;
            this.update.emit();
          }, err => {
            this.sending = false;
            Swal.fire('Oups', 'Une erreur s\'est produite pendant le changement d\'état. Réessayez plus tard', 'error');
          });
      } else {
        this.sending = false;
      }
    }, err => this.sending = false);
  }
}
