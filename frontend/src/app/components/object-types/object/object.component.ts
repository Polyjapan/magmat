import { Component, OnInit } from '@angular/core';
import { CompleteObject, ObjectStatus, statusToString } from '../../../data/object';
import { ObjectsService } from '../../../services/stateful/objects.service';
import { ActivatedRoute, Router } from '@angular/router';
import { lastChild, storageLocationToString } from '../../../data/storage-location';
import { externalLoanToString } from 'src/app/data/external-loan';
import { ObjectLogWithUser } from '../../../data/object-log';
import Swal from 'sweetalert2';
import { CompleteObjectComment } from '../../../data/object-comment';
import { AuthService } from '../../../services/auth.service';
import { merge, Observable, of } from 'rxjs';
import { animate, state, style, transition, trigger } from '@angular/animations';
import { SseService } from "../../../services/sse.service";
import { map, switchMap } from "rxjs/operators";
import { ObjectsMutationService } from "../../../services/objects-mutation.service";

type ObjectData = [string, string, boolean, (string | number)[]?][]

@Component({
  selector: 'app-object',
  templateUrl: './object.component.html',
  styleUrls: ['./object.component.css'],
})
export class ObjectComponent implements OnInit {
  object$: Observable<CompleteObject>;
  objectData$: Observable<ObjectData>
  id: number;

  constructor(private service: ObjectsService,
              private mutationService: ObjectsMutationService,
              private route: ActivatedRoute,
              private auth: AuthService,
              private router: Router) {
  }

  objectData({ object, objectType, ...co }: CompleteObject): ObjectData {
    const arr: [string, string, boolean, (string | number)[]?][] = [
      ['ASSET TAG', object.assetTag, false],
      ['CATÉGORIE', objectType.name, false, ['/', 'object-types', object.objectTypeId]],
      (object.description ?? objectType.description) ? ['DESCRIPTION', object.description ?? objectType.description, object.description === null || object.description === undefined] : undefined,
      object.inconvStorageLocation ? ['STOCKAGE (CONVENTION)', storageLocationToString(co.inconvStorageLocationObject), false, ['/', 'storages', lastChild(co.inconvStorageLocationObject).storageId]] : undefined,
      object.storageLocation ? ['STOCKAGE (ANNÉE)', storageLocationToString(co.storageLocationObject), false, ['/', 'storages', lastChild(co.storageLocationObject).storageId]] : undefined,
      co.partOfLoanObject ? ['EMPRUNT PARENT', co.partOfLoanObject?.externalLoan?.loanTitle, object.partOfLoan === null || object.partOfLoan === undefined, ['/', 'external-loans', co.partOfLoanObject.externalLoan.externalLoanId]] : undefined,
      object.reservedFor ? ['RÉSERVÉ POUR', (co.reservedFor.details.firstName + ' ' + co.reservedFor.details.lastName + ' (' + object.reservedFor + ')'), false] : undefined,
      object.plannedUse ? ['UTILISATION PRÉVUE', object.plannedUse, false] : undefined,
      object.depositPlace ? ['LIEU DE DÉPOSE', object.depositPlace, false] : undefined,
      ['ÉTAT ACTUEL', statusToString(object.status), false],
    ];

    return arr.filter(e => e);
  }

  ngOnInit() {
    this.route.paramMap.subscribe(params => {
      this.id = Number.parseInt(params.get('id'), 10);
      this.object$ = this.service.getObjectById(this.id)
      this.objectData$ = this.object$.pipe(map(this.objectData))
    });
  }


  delete(object: CompleteObject) {
    Swal.fire({
      titleText: 'Es-tu certain de vouloir faire cela ?',
      html: 'Cette opération placera l\'objet dans un état final "Remisé" dont il ne pourra plus jamais sortir.<br>Il disparaitra également ' +
        'des listes d\'objets, mais pourra toujours être retrouvé avec son asset tag.<br>Son asset tag ne sera pas libéré.',
      confirmButtonText: 'Oui',
      cancelButtonText: 'Non',
      showCancelButton: true, showConfirmButton: true
    }).then(res => {
      if (res.value === true) {
        this.mutationService
          .changeState(object.object.objectId, ObjectStatus.DELETED, this.auth.getToken().userId)
          .subscribe(succ => {
            Swal.fire(undefined, undefined, 'success');
            this.router.navigate(['/', 'object-types', object.object.objectTypeId]);
          }, err => {
            Swal.fire('Erreur inconnue', undefined, 'error');
            console.log(err);
          });
      }
    });
  }
}
