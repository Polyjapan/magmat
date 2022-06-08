import {Component, Input, OnInit} from '@angular/core';
import {ObjectStatus, statusToString} from '../../../data/object';

@Component({
  selector: 'app-status-label',
  templateUrl: './status-label.component.html',
  styleUrls: ['./status-label.component.css']
})
export class StatusLabelComponent implements OnInit {
  @Input() status: ObjectStatus;
  statusToString = statusToString;

  constructor() {
  }

  ngOnInit(): void {
  }

  statusToClass(status: ObjectStatus) {
    switch (status) {
      case ObjectStatus.IN_STOCK:
        return 'success';
      case ObjectStatus.LOST:
      case ObjectStatus.DELETED:
        return 'danger';
      case ObjectStatus.RESTING:
        return 'info-secondary'
      case ObjectStatus.OUT:
        return 'info';
    }
  }
}
