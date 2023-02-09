import { Component, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { Observable } from "rxjs";
import { ObjectLogWithUser } from "../../../../data/object-log";
import { ObjectLogsService } from "./object-logs.service";
import { animate, state, style, transition, trigger } from "@angular/animations";

@Component({
  selector: 'app-object-logs',
  templateUrl: './object-logs.component.html',
  styleUrls: ['./object-logs.component.css'],
  animations: [
    trigger('detailExpand', [
      state('collapsed', style({ height: '0px', minHeight: '0' })),
      state('expanded', style({ height: '*' })),
      transition('expanded <=> collapsed', animate('225ms cubic-bezier(0.4, 0.0, 0.2, 1)')),
    ]),
  ],
})
export class ObjectLogsComponent implements OnChanges {
  @Input() id: number;

  readonly logColumnsToDisplay = ['timestamp', 'target', 'user']
  expandedElement: ObjectLogWithUser | null;
  logs$: Observable<ObjectLogWithUser[]>;
  constructor(
    private readonly objectLogs: ObjectLogsService
  ) { }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.id) {
      this.logs$ = this.objectLogs.getObjectLogs(this.id)
    }
  }

}
