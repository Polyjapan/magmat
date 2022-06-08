import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import Swal from "sweetalert2";
import {StorageLocationsService} from '../../../services/storage-locations.service';

@Component({
  selector: 'app-quickmove',
  templateUrl: './quickmove.component.html',
  styleUrls: ['./quickmove.component.css']
})
export class QuickmoveComponent implements OnInit {
  @Input() locationId: number;
  @Output() success = new EventEmitter();

  quickMoveArea: string;
  moveType = false;
  moveAllOfType = false;
  sending = false;

  constructor(private sl: StorageLocationsService) { }

  ngOnInit() {
  }

  moveObjects() {
    if (!this.sending) {
      this.sending = true;
    } else {
      return;
    }

    const quickMoveItems = this.quickMoveArea.split('\n').map(item => item.trim());
    const moveType = this.moveType;
    const moveAll = this.moveType && this.moveAllOfType;

    this.sl.moveItems(this.locationId, quickMoveItems, moveType, moveAll)
      .subscribe(res => {
        this.sending = false;
        this.quickMoveArea = '';
        this.moveType = false;
        this.moveAllOfType = false;
        this.success.emit();
        Swal.fire('Déplacement terminé', undefined, 'success');
      }, err => {
        this.sending = false;
        Swal.fire('Une erreur s\'est produite', undefined, 'error');
      });
  }
}
