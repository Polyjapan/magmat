import {Component, OnInit} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {StorageLocationsService} from '../../../services/storage-locations.service';
import {
  lastChild,
  objectHasParentLocation,
  Storage,
  storageLocationToString,
  StorageTree
} from '../../../data/storage-location';
import {CompleteObject} from '../../../data/object';
import {ObjectsService} from '../../../services/objects.service';
import {BehaviorSubject, Observable, partition, ReplaySubject, Subject} from 'rxjs';
import Swal from 'sweetalert2';
import {CreateStorageLocationComponent} from '../create-storage-location/create-storage-location.component';
import {MatDialog} from '@angular/material/dialog';
import {map, switchMap, tap} from 'rxjs/operators';
import {MatTableDataSource} from '@angular/material/table';
import {MatSlideToggleChange} from '@angular/material/slide-toggle';

@Component({
  selector: 'app-show-storage-location',
  templateUrl: './show-storage-location.component.html',
  styleUrls: ['./show-storage-location.component.css']
})
export class ShowStorageLocationComponent implements OnInit {
  id: number | null = null;
  inConv: boolean = false;
  eventId?: number = undefined;


  errors: Observable<string>;
  treeWithChildren: Observable<StorageTree>;
  locationWithParents: Observable<StorageTree>;
  items: Observable<CompleteObject[]>;

  // TODO - use objects-list instead
  dataSource: MatTableDataSource<CompleteObject> = new MatTableDataSource();

  displayAll: boolean = true;

  constructor(private ar: ActivatedRoute, private router: Router, private sl: StorageLocationsService, private obj: ObjectsService, private dialog: MatDialog) {
  }

  ngOnInit() {
    // this.locations.getStorageLocationsByParent(Number.parseInt(params.get('parent')))
    this.ar.paramMap.subscribe(map => {
      this.id = Number.parseInt(map.get('id'), 10);

      this.treeWithChildren = undefined;
      this.items = undefined;
      this.locationWithParents = undefined;

      this.refresh();
    });
  }

  displayStorageSpace(loc: StorageTree): string {
    return storageLocationToString(loc);
  }

  refresh() {
    const [succ, err] = partition(this.sl.getStorageTree(this.id), el => (el ?? null) !== null)

    this.treeWithChildren = succ.pipe(tap(loc => {
      this.inConv = loc?.event !== undefined;
      this.eventId = loc?.event;
    }));// .subscribe(loc => this.location = loc);

    this.errors = err.pipe(map(err => "Impossible de trouver cet emplacement."))

    this.items = this.treeWithChildren.pipe(switchMap(v =>
      this.obj.getObjects().pipe(map(allObj => allObj.filter(o => objectHasParentLocation(this.inConv ? o.inconvStorageLocationObject : o.storageLocationObject, v?.storageId))))
    ));
    this.locationWithParents = this.sl.getStorageWithParents(this.id);


    this.dataSource.filterPredicate = (obj, f) => {
      return this.displayAll || (this.inConv ? obj.object.inconvStorageLocation === this.id : obj.object.storageLocation === this.id);
    };
    this.dataSource.filter = 'true';
    this.items.subscribe(r => this.dataSource.data = r);
  }

  /*
  isInherited(elem: CompleteObject) {
    const isInConv = this.location.inConv;

    if (isInConv) {
      return elem.object.inconvStorageLocation === undefined;
    } else {
      return elem.object.storageLocation === undefined;
    }
  }
  */

  displayChange($event: MatSlideToggleChange) {
    this.dataSource.filter = '' + $event.checked;
  }

  update(locationWithParents: StorageTree) {
    const tree = lastChild(locationWithParents);
    const storage = new Storage();
    storage.storageId = tree.storageId;
    storage.storageName = tree.storageName;
    storage.parentStorageId = tree.parentStorageId;
    storage.event = tree.event;
    this.dialog.open(CreateStorageLocationComponent, {data: storage});
  }

  create(locationWithParents: StorageTree) {
    const tree = lastChild(locationWithParents);
    const storage = new Storage();
    storage.parentStorageId = tree.storageId;
    storage.event = tree.event;
    this.dialog.open(CreateStorageLocationComponent, {data: storage});
  }

  delete() {
    Swal.fire({
      titleText: 'Êtes vous sûr ?', text: 'Voulez vous vraiment supprimer cet emplacement de stockage ?',
      showConfirmButton: true, showCancelButton: true, confirmButtonText: 'Oui', cancelButtonText: 'Non'
    }).then(result => {
      if (result && result.value === true) {
        this.treeWithChildren = undefined;

        this.sl.deleteStorage(this.id).subscribe(res => {
          this.sl.refresh();
          this.router.navigate(['..'], {relativeTo: this.ar});
        }, fail => {
          Swal.fire('Oups', 'On dirait que ça n\'a pas marché.', 'error');
          this.refresh();
        });
      }
    });
  }
}
