import {Component, Inject, OnInit} from '@angular/core';
import {objectHasParentLocation, Storage, StorageTree} from '../../../data/storage-location';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';
import {StorageLocationsService} from '../../../services/storage-locations.service';
import Swal from 'sweetalert2';
import {EventsService} from '../../../services/events.service';

@Component({
  selector: 'app-create-storage-location',
  templateUrl: './create-storage-location.component.html',
  styleUrls: ['./create-storage-location.component.css']
})
export class CreateStorageLocationComponent implements OnInit {
  storageLocation: Storage;
  sending: boolean = false;
  eventId: number;
  parent: StorageTree;

  constructor(public dialogRef: MatDialogRef<CreateStorageLocationComponent>,
              private service: StorageLocationsService,
              private events: EventsService,
              @Inject(MAT_DIALOG_DATA) private data?: Storage) {
    if (data) {
      if (data.parentStorageId) {
        this.service.getStorageWithParents(data.parentStorageId).subscribe(r => {
          this.parent = r;
          this.storageLocation = data;
        })
      } else {
        this.storageLocation = data;
      }
    } else {
      this.storageLocation = new Storage();
      this.storageLocation.event = undefined;
    }
  }

  get isUpdate(): boolean {
    return (this.storageLocation?.storageId ?? null) !== null;
  }

  get inConv(): boolean {
    return this.storageLocation.event !== undefined;
  }

  set inConv(v: boolean) {
    this.storageLocation.event = v ? this.eventId : undefined;
  }

  ngOnInit() {
    this.events.getCurrentEventId().subscribe(ev => this.eventId = ev);
  }

  submit($event) {
    if (this.storageLocation.parentStorageId) {
      if (!this.parent) {
        Swal.fire('Erreur', 'Une erreur s\'est produite: un stockage parent est défini mais aucun stockage parent correspondant n\'est présdent', 'error');
        return;
      } else if (this.storageLocation.storageId) {
        if (objectHasParentLocation(this.parent, this.storageLocation.storageId)) {
          Swal.fire('Erreur', 'Une erreur s\'est produite: impossible de définir comme parent un stockage enfant de ce stockage', 'error');
          return;
        }
      }

      this.storageLocation.event = this.parent.event;
    }


    console.log(this.storageLocation);


    if (!this.sending) {
      this.sending = true;
    } else {
      return;
    }

    this.service.createUpdateStorage(this.storageLocation)
      .subscribe(succ => {
        this.service.refresh();
        this.dialogRef.close();
        Swal.fire('Emplacement ' + (this.isUpdate ? 'modifié' : 'créé'), 'L\'emplacement de stockage a bien été ' + (this.isUpdate ? 'modifié' : 'créé') + '.', 'success');
      }, err => {
        Swal.fire('Oups', 'Une erreur s\'est produite', 'error');
        this.sending = false;
      });

  }

}
