import {Component, OnInit} from '@angular/core';
import {Observable} from 'rxjs';
import {ObjectTypeTree} from '../../data/object-type';
import {ObjectTypesService} from '../../services/object-types.service';
import {MatDialog} from '@angular/material/dialog';
import {Router} from '@angular/router';
import {CreateObjectTypeComponent} from './create-object-type/create-object-type.component';

@Component({
  selector: 'app-object-types',
  templateUrl: './object-types.component.html',
  styleUrls: ['./object-types.component.css']
})
export class ObjectTypesComponent implements OnInit {
  objectTypes$: Observable<ObjectTypeTree[]>;

  constructor(private objectTypes: ObjectTypesService, private dialog: MatDialog, private router: Router) {
  }

  ngOnInit() {
    this.objectTypes$ = this.objectTypes.getObjectTypes();
  }

  create() {
    this.dialog.open(CreateObjectTypeComponent);
  }

  refresh() {
    this.objectTypes.refresh();
  }

  goTo($event: number) {
    this.router.navigate(['/', 'object-types', $event]);
  }
}
