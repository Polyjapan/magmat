import {Component, OnInit} from '@angular/core';
import {CompleteObject} from '../../../data/object';
import {Event} from '../../../data/event';
import {ObjectsService} from '../../../services/objects.service';
import {StorageLocationsService} from '../../../services/storage-locations.service';
import {LoansService} from '../../../services/loans.service';
import { MatDialog } from '@angular/material/dialog';
import {ActivatedRoute, Router} from '@angular/router';
import Swal from 'sweetalert2';
import {EventsService} from '../../../services/events.service';
import {lastChild} from "../../../data/object-type";

@Component({
  selector: 'app-update-object',
  templateUrl: './update-object.component.html',
  styleUrls: ['./update-object.component.css']
})
export class UpdateObjectComponent implements OnInit {
  object: CompleteObject;
  event: Event;
  sending = false;

  constructor(private objects: ObjectsService, private storagesService: StorageLocationsService, private loansService: LoansService,
              private dialog: MatDialog, private route: ActivatedRoute, private router: Router, private events: EventsService) {
  }

  ngOnInit() {
    this.route.paramMap.subscribe(map => {
      if (map.has('objectId')) {
        this.objects.getObjectById(Number.parseInt(map.get('objectId'), 10)).subscribe(obj => this.object = {...obj});
      }
    });

    this.events.getCurrentEvent().subscribe(ev => this.event = ev);
  }

  update() {
    if (this.sending) {
      return;
    }

    const objectType = lastChild(this.object.objectTypeAncestry);
    if (this.object.object.objectTypeId !== objectType.objectTypeId) {
      this.object.object.objectTypeId = objectType.objectTypeId;
    }

    this.sending = true;
    this.objects.updateObject(this.object, this.event?.id).subscribe(id => {
      Swal.fire({title: 'Objet mis à jour', icon: 'success', timer: 3000, timerProgressBar: true}).then(() => {
        this.router.navigate(['objects', this.object.object.objectId]);
      });
    }, err => {
      this.sending = false;
      console.log(err)
      Swal.fire({
        title: 'Erreur!',
        text: 'Une erreur s\'est produite pendant l\'envoi. Merci de réessayer.\n\n' + err.error,
        icon: 'error',
        timer: 3000,
        timerProgressBar: true
      });
    });
  }

}
