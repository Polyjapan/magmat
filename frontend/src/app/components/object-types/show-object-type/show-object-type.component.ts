import {Component, OnInit} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {ObjectsService} from '../../../services/objects.service';
import {
  objectHasParentObjectType,
  lastChild,
  ObjectType,
  ObjectTypeAncestry,
  ObjectTypeTree,
  objectTypeToString
} from '../../../data/object-type';
import {Storage, storageLocationToString, StorageTree} from '../../../data/storage-location';
import {CompleteObject} from '../../../data/object';
import Swal from 'sweetalert2';
import {ObjectTypesService} from '../../../services/object-types.service';
import {Observable, partition} from 'rxjs';
import {map, switchMap} from 'rxjs/operators';
import {CreateStorageLocationComponent} from '../../storage-locations/create-storage-location/create-storage-location.component';
import {MatDialog} from '@angular/material/dialog';
import {CreateObjectTypeComponent} from '../create-object-type/create-object-type.component';

@Component({
  selector: 'app-show-object-type',
  templateUrl: './show-object-type.component.html',
  styleUrls: ['./show-object-type.component.css']
})
export class ShowObjectTypeComponent implements OnInit {
  storageLocationToString = storageLocationToString;
  id: number;
  deleting: boolean;

  objectTypeToString = objectTypeToString;
  errors: Observable<string>;
  tree$: Observable<ObjectTypeTree>;
  parents$: Observable<ObjectTypeAncestry>;
  items$: Observable<CompleteObject[]>;
  displayAll: boolean = true;

  lastChild = lastChild

  constructor(private route: ActivatedRoute, private objectsService: ObjectsService, private objectTypeService: ObjectTypesService,
              private router: Router, private dialog: MatDialog) {
  }

  ngOnInit() {
    this.route.paramMap.subscribe(map => {
      this.id = Number.parseInt(map.get('typeId'), 10);

      this.tree$ = undefined;
      this.parents$ = undefined;
      this.items$ = undefined;


      this.refresh();
    });
  }

  refresh() {
    const [succ, err] = partition(this.objectTypeService.getObjectTypeTree(this.id), el => (el ?? null) !== null)

    this.tree$ = succ.pipe();
    this.errors = err.pipe(map(err => "Impossible de trouver cette catégorie."))

    this.items$ = this.tree$.pipe(switchMap(v => this.objectsService.getObjects()
      .pipe(map(allObj => allObj.filter(o => this.displayAll ? objectHasParentObjectType(o.objectTypeAncestry, this.id) : o.object.objectTypeId === this.id )))))
    this.parents$ = this.objectTypeService.getObjectTypeWithParents(this.id);
  }


  objectTypeData(objectType: ObjectTypeAncestry): [string, string, (string | number)[]?][] {
    const arr: [string, string, (string | number)[]?][] = [
      objectType.objectType.description ? ['DESCRIPTION', objectType.objectType.description] : undefined,
      objectType.objectType.partOfLoanObject ? ['EMPRUNT PARENT', objectType.objectType.partOfLoanObject?.externalLoan?.loanTitle, ['/', 'external-loans', objectType.objectType.partOfLoan]] : undefined,
    ];

    return arr.filter(e => e);
  }

  update(ot: ObjectTypeAncestry) {
    const tree = {...lastChild(ot) }
    this.dialog.open(CreateObjectTypeComponent, {data: tree});
  }

  create(ot: ObjectTypeAncestry) {
    const tree = lastChild(ot);
    const data = new ObjectType();
    data.parentObjectTypeId = tree.objectTypeId;
    this.dialog.open(CreateObjectTypeComponent, {data: data});
  }


  delete() {
    Swal.fire({
      titleText: 'Voulez vous vraiment faire cela ?',
      text: 'La catégorie d\'objet sera caché des listes, et tous les objets encore dans cette catégorie passeront à l\'état remisé (supprimé - irréversible !).',
      icon: 'warning',
      confirmButtonText: 'Oui, je le veux',
      cancelButtonText: 'Non surtout pas !',
      showConfirmButton: true,
      showCancelButton: true
    }).then(res => {
      if (res.value === true) {
        if (this.deleting) {
          return;
        }
        this.deleting = true;

        this.objectTypeService.deleteObjectType(this.id)
          .subscribe(_ => {
            this.router.navigate(['..'], {relativeTo: this.route});
          }, _ => {
            Swal.fire('Oups', 'On dirait que ça ne fonctionne pas. Réessayez plus tard', 'error');
            this.deleting = false;
          });
      }
    });
  }
}
