import {Component, OnInit, ViewChild} from '@angular/core';
import {CompleteObject, ObjectStatus, statusToString} from '../../data/object';
import {Router} from '@angular/router';
import {FormControl} from '@angular/forms';
import {catchError, map, switchMap, tap} from 'rxjs/operators';
import {ObjectsService} from '../../services/stateful/objects.service';
import {combineLatest, forkJoin, Observable, of} from 'rxjs';
import {requestSignature} from '../../services/signature';
import { MatDialog } from '@angular/material/dialog';
import Swal from 'sweetalert2';
import {SelectUserComponent} from '../selectors/select-user/select-user.component';
import {storageLocationToString} from '../../data/storage-location';
import { ObjectsMutationService } from "../../services/objects-mutation.service";

@Component({
  selector: 'app-homepage',
  templateUrl: './homepage.component.html',
  styleUrls: ['./homepage.component.css']
})
export class HomepageComponent implements OnInit {

  quickLoanTag: string;
  quickLoanObject: CompleteObject;
  quickMoveStorage: number;
  quickLoanMultiUser: number;
  quickLoanMultiTags = new FormControl();
  quickLoanMultiSending = false;
  ObjectStatus = ObjectStatus;
  quickLoanFoundObjects: CompleteObject[];
  @ViewChild('quickMultiLoanUserSelect', {static: true}) userSelector: SelectUserComponent;
  storageLocationToString = storageLocationToString;

  constructor(private router: Router, private objectsService: ObjectsService, private objectsMutation: ObjectsMutationService, private dialog: MatDialog) {
  }

  get currentError(): string {
    if (!this.quickLoanFoundObjects) {
      return 'Aucun objet indiqué';
    }

    const notFound = this.quickLoanFoundObjects.indexOf(undefined);
    if (notFound !== -1) {
      return 'Un objet de la liste n\'existe pas en position ' + (notFound + 1);
    }
    return undefined;
  }

  get targetState(): ObjectStatus {
    if (!this.quickLoanFoundObjects) {
      return undefined;
    }

    const targetStatuses = new Set(this.quickLoanFoundObjects
      .map(e => e ? ((e.object.status !== ObjectStatus.IN_STOCK) ? ObjectStatus.IN_STOCK : ObjectStatus.OUT) : undefined));

    if (targetStatuses.size > 1) {
      return undefined;
    } else {
      return targetStatuses.values().next().value;
    }
  }

  get requiresSignature(): boolean {
    if (!this.quickLoanFoundObjects) {
      return false;
    }

    const targetStatuses = this.quickLoanFoundObjects.map(e => e.object.requiresSignature);
    return targetStatuses.indexOf(true) !== -1 && this.targetState === ObjectStatus.OUT;
  }


  private getObjectByTag(tag: string): Observable<CompleteObject> {
    return this.objectsService.objects$
      .pipe(map(objects => objects.find(object => object.object.assetTag === tag)))
  }

  ngOnInit() {
    this.quickLoanMultiTags.valueChanges
      .pipe(
        map(v => (v ?? '').split('\n').map(o => o.trim()).filter(o => o.length > 0)),
        switchMap(lst => {
          const observables: Observable<CompleteObject>[] =
            lst.map(elem =>
              (this.getObjectByTag(elem)
                .pipe(catchError(err => of(undefined)))) as Observable<CompleteObject>
            );

          return combineLatest(observables);

        }),

      ).subscribe(lst => this.quickLoanFoundObjects = lst);
  }


  redirectTo($event?: CompleteObject | null) {
    if ($event?.object) {
      this.router.navigate(['/', 'objects', $event.object.objectId]);
    }
  }

  quickLoan() {
    if (this.quickLoanMultiSending) {
      return;
    }
    this.quickLoanMultiSending = true;

    if (this.requiresSignature) {
      const sgnObjects = this.quickLoanFoundObjects
        .filter(o => o.object.requiresSignature).map(o => o.objectType.name + ' ' + o.object.suffix).join(', ');
      const snapObjects = this.quickLoanFoundObjects;
      const snapState = this.targetState;
      requestSignature(this.dialog, sgnObjects,
        sgn => this.doChangeState(snapState, snapObjects, sgn),
        () => this.quickLoanMultiSending = false);
    } else {
      this.doChangeState(this.targetState, this.quickLoanFoundObjects);
    }
  }

  private doChangeState(targetState: ObjectStatus, objects: CompleteObject[], signature?: string) {
    const objList = objects.map(o => o.objectType.name + ' ' + o.object.suffix).join(', ');

    const userId = this.quickLoanMultiUser;

    Swal.fire({
      titleText: 'Confirmer le changement d\'état',
      html: 'Voulez vous confirmer le passage à l\'état <b>' + statusToString(targetState) + '</b> pour les objets ' + objList + ' ?',
      icon: 'question',
      showConfirmButton: true,
      showCancelButton: true,
      confirmButtonText: 'Confirmer',
      cancelButtonText: 'Annuler'
    }).then(data => {
      if (data.value) {
        const observables = objects.map(o =>
          this.objectsMutation
            .changeState(o.object.objectId, targetState, userId, o.object.requiresSignature ? signature : undefined)
            .pipe(
              map(res => ({obj: o, success: true})),
              catchError(err => of({obj: o, success: false}))
            )
        );

        forkJoin(observables).subscribe(lst => {
          const failed = lst.filter(o => o.success === false).map(o => o.obj.objectType.name + ' ' + o.obj.object);

          if (failed.length === 0) {
            Swal.fire('Changement réussi', undefined, 'success');
            this.quickLoanMultiTags.reset();
            this.userSelector.reset();
          } else {
            Swal.fire('Changement partiel', 'Le changement a échoué sur les objets suivants : ' + failed.join(', '), 'warning');
          }

          this.quickLoanMultiSending = false;
        });
      } else {
        this.quickLoanMultiSending = false;
      }
    }, err => this.quickLoanMultiSending = false);
  }
}
