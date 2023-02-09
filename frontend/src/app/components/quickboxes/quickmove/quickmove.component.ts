import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import Swal from "sweetalert2";
import {StorageLocationsService} from '../../../services/stateful/storage-locations.service';
import {ObjectsService} from '../../../services/stateful/objects.service';
import {Observable} from 'rxjs';
import { RefreshAllService } from "../../../services/refresh-all.service";

@Component({
  selector: 'app-quickmove',
  templateUrl: './quickmove.component.html',
  styleUrls: ['./quickmove.component.css']
})
export class QuickmoveComponent implements OnInit {
  @Input() locationId: number;
  @Output() success = new EventEmitter();

  quickMoveArea: string;
  moveAll = false;
  sending = false;

  constructor(private sl: StorageLocationsService, private objectsService: ObjectsService, private refreshService: RefreshAllService) { }

  ngOnInit() {
  }

  moveObjects() {
    if (!this.sending) {
      this.sending = true;
    } else {
      return;
    }

    const quickMoveItems = this.quickMoveArea.split('\n').map(item => item.trim());

    this.sl.moveItems(this.locationId, quickMoveItems, this.moveAll)
      .subscribe(res => {
        this.refreshService.refresh();
        this.sending = false;
        this.quickMoveArea = '';
        this.moveAll = false;
        this.success.emit();
        Swal.fire('Déplacement terminé', undefined, 'success');
      }, err => {
        this.sending = false;
        Swal.fire('Une erreur s\'est produite', undefined, 'error');
      });
  }
}
