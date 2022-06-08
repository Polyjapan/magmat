import { Component, OnInit } from '@angular/core';
import {CompleteObject, CompleteObjectWithUser} from '../../data/object';
import {ObjectsService} from '../../services/objects.service';
import {ProfileService} from '../../services/profile.service';
import {switchMap} from 'rxjs/operators';

@Component({
  selector: 'app-all-objects-out',
  templateUrl: './all-objects-out.component.html',
  styleUrls: ['./all-objects-out.component.css']
})
export class AllObjectsOutComponent implements OnInit {
  loans: CompleteObjectWithUser[];

  constructor(private backend: ObjectsService, private users: ProfileService) {
  }

  ngOnInit() {
    this.backend.getObjectsLoaned().subscribe(loans => this.loans = loans);
  }

}
