import {Component, OnInit} from '@angular/core';
import {UserProfile} from '../../data/user';
import {CompleteObject, statusToString} from '../../data/object';
import {ObjectsService} from '../../services/objects.service';
import {map, switchMap} from 'rxjs/operators';
import {ObjectLogWithObject} from '../../data/object-log';

@Component({
  selector: 'app-internal-loans',
  templateUrl: './user-logs.component.html',
  styleUrls: ['./user-logs.component.css']
})
export class UserLogsComponent implements OnInit {

  selectedUser: UserProfile;
  loans: CompleteObject[];
  history: ObjectLogWithObject[];
  statusToString = statusToString;

  constructor(private backend: ObjectsService) {
  }

  ngOnInit() {
  }


  dateFormat(log: ObjectLogWithObject) {
    const date = log.objectLog.timestamp;

    if (typeof date === 'string') {
      return new Date(Date.parse(date)).toLocaleString();
    } else {
      return date.toLocaleString();
    }
  }

  onSelect($event: UserProfile) {
    this.selectedUser = $event;
    this.loans = undefined;

    if (this.selectedUser !== undefined) {
      this.backend.getObjectsLoanedToUser(this.selectedUser.id)
        .pipe(switchMap(loaned => this.backend.getLoansHistoryForUser(this.selectedUser.id)
          .pipe(map(history => [loaned, history]))))
        .subscribe(res => {
          this.loans = res[0];
          this.history = res[1] as ObjectLogWithObject[];
        });
    }
  }
}
