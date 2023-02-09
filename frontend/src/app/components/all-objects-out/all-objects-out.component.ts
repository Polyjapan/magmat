import { Component, OnInit } from '@angular/core';
import { CompleteObject, ObjectStatus } from '../../data/object';
import { ObjectsService } from '../../services/stateful/objects.service';
import { ViewUserService } from '../users/view-user/view-user.service';
import { Observable } from "rxjs";
import { AllObjectsComponent } from "../object-types/all-objects/all-objects.component";
import { map } from "rxjs/operators";

@Component({
  selector: 'app-all-objects-out',
  templateUrl: './all-objects-out.component.html',
  styleUrls: ['./all-objects-out.component.css']
})
export class AllObjectsOutComponent implements OnInit {
  objects$: Observable<CompleteObject[]>;

  private static readonly statuses: Set<ObjectStatus> = new Set([ObjectStatus.RESTING, ObjectStatus.LOST, ObjectStatus.OUT])

  constructor(private backend: ObjectsService, private users: ViewUserService) {
  }

  ngOnInit() {
    this.objects$ = this.backend.objects$
      .pipe(
        map(
          objects => objects.filter(obj => AllObjectsOutComponent.statuses.has(obj.object.status))
        )
      )
  }
}
