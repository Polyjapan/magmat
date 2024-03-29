import {Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges} from '@angular/core';
import Swal from 'sweetalert2';
import {ObjectStatus, SingleObject} from '../../../data/object';
import {ObjectsService} from '../../../services/stateful/objects.service';
import {ObjectType} from '../../../data/object-type';
import {EventsService} from '../../../services/stateful/events.service';
import {Event} from '../../../data/event';
import { QuickItemCreateService } from "./quick-item-create.service";
import { ObjectsMutationService } from "../../../services/objects-mutation.service";

@Component({
  selector: 'app-quick-item-create',
  templateUrl: './quick-item-create.component.html',
  styleUrls: ['./quick-item-create.component.css']
})
export class QuickItemCreateComponent implements OnChanges {
  @Input() objectType: ObjectType;
  @Output() createSuccess = new EventEmitter<any>();
  @Input() setLoan: number = undefined;

  prefix: string;
  suffixStart: number;
  tags: string;
  sending = false;
  eventLocation: number;
  location: number;
  requiresSignature: boolean = false;

  event: Event = undefined;


  async updatePrefix(prefix: string) {
    this.prefix = prefix;
    this.suffixStart = await this.qicService.getNextSuffix(this.objectType.objectTypeId, this.prefix)
  }

  constructor(private objectsService: ObjectsMutationService, eventsService: EventsService, private qicService: QuickItemCreateService) {
    eventsService.currentEvent$.subscribe(ev => this.event = ev);
  }

  async ngOnChanges(changes: SimpleChanges) {
    if (changes.objectType && ((this.prefix ?? '')  === '')) {
      void this.updatePrefix('');
    }
  }


  get simulation() {
    const objects = this.createObjects();
    if (!objects) {
      return undefined;
    }

    return objects.map(obj =>
      this.objectType.name + ' ' + obj.suffix + ' aura le tag ' + obj.assetTag
    ).join('\n');
  }

  postObjects() {
    const objects = this.createObjects();
    if (!objects) {
      return undefined;
    }

    if (this.sending) {
      return;
    } else {
      this.sending = true;
    }

    this.objectsService.createObjects(objects, this.event?.id).subscribe(result => {
      if (result.inserted.length !== 0) {
        this.createSuccess.emit(result.inserted);
      }
      this.sending = false;

      if (result.notInserted.length > 0) {
        const notAdded = result.notInserted.map(ni => ni.assetTag + ' (' + this.objectType.name + ' ' + ni.suffix + ')')
          .join('\n');

        Swal.fire('Objets non ajoutés', 'Certains objets n\'ont pas été ajoutés :\n' + notAdded, 'warning');
      } else if (result.inserted.length > 0) {
        Swal.fire('Objets ajoutés', 'Les objets ont bien été ajoutés !', 'success');
      } else {
        Swal.fire('Aucun objet ajouté', 'Aucun objet n\'a été ajouté... Peut être avez vous envoyé une requête vide ?', 'question');
      }

      this.suffixStart = this.suffixStart + objects.length;
      this.tags = '';
    }, err => {
      Swal.fire('Une erreur s\'est produite.', err.toString(), 'error');
      this.sending = false;
    });
  }

  createObjects(): SingleObject[] {
    let suffix = this.suffixStart;

    if (!this.tags || !this.suffixStart) {
      return undefined;
    }

    return this.tags.split('\n').map(tag => tag.trim()).filter(tag => tag.length > 0).map(tag => {
      return {
        objectTypeId: this.objectType.objectTypeId,
        suffix: (this.prefix && this.prefix.length > 0 ? this.prefix + ' ' : '') + (suffix++),
        assetTag: tag,
        status: ObjectStatus.IN_STOCK,
        partOfLoan: this.setLoan,
        storageLocation: this.location,
        inconvStorageLocation: this.eventLocation,
        requiresSignature: this.requiresSignature, // todo
      };
    });
  }

}
