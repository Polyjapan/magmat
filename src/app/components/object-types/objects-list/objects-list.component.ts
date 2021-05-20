import {Component, Input, OnChanges, OnInit, ViewChild} from '@angular/core';
import {CompleteObject, CompleteObjectWithUser, statusToString} from '../../../data/object';
import {storageLocationToString} from 'src/app/data/storage-location';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';

@Component({
  selector: 'app-objects-list',
  templateUrl: './objects-list.component.html',
  styleUrls: ['./objects-list.component.css']
})
export class ObjectsListComponent implements OnChanges, OnInit {
  @Input() fullWidth: boolean = false;
  @Input() objects: (CompleteObject | CompleteObjectWithUser)[];

  @ViewChild(MatSort, {static: true}) sort: MatSort;
  dataSource: MatTableDataSource<CompleteObject | CompleteObjectWithUser>;

  constructor() {
  }

  ngOnInit() {
    this.dataSource = new MatTableDataSource(this.objects);
  }

  getObjectId(o: (CompleteObject | CompleteObjectWithUser)) {
    const object = (o instanceof CompleteObjectWithUser || (o as any).user) ? ((o as CompleteObjectWithUser).object) : o as CompleteObject;
    return object.object.objectId;
  }

  get columns() {
    const hasUsers = this.objects.filter(o => (o instanceof CompleteObjectWithUser || (o as any).user)).length > 0;
    const base =  ['assetTag', 'name', 'inConvStorage', 'plannedUse', 'reservedFor', 'depositPlace', 'status'];

    if (hasUsers) {
      base.push('user');
    }

    // TODO: Louis - I don't like the look of this table with the edit button, but if edit is frequently needed then we may need to put this back
    // base.push('actions');
    return base;

  }

  dataAccessor(_o: (CompleteObject | CompleteObjectWithUser), column: string): string {
    if (_o instanceof CompleteObjectWithUser || (_o as any).user) {
      if (column === 'user') {
        const user = (_o as CompleteObjectWithUser).user;
        return user.details.firstName + ' ' + user.details.lastName;
      }
      return this.dataAccessor((_o as CompleteObjectWithUser).object, column);
    }
    const o = _o as CompleteObject;

    switch (column) {
      case 'status':
        // Only for sorting
        return statusToString(o.object.status);
      case 'inConvStorage':
        return storageLocationToString(o.inconvStorageLocationObject);
      case 'name':
        return o.objectType.name + ' ' + o.object.suffix;
      case 'reservedFor':
        return o.reservedFor ? o.reservedFor.details.firstName + ' ' + o.reservedFor.details.lastName : '';
      default:
        return o.object[column];
    }
  }

  ngOnChanges(changes) {
    this.dataSource.data = this.objects;
    this.dataSource.sort = this.sort;
    this.dataSource.sortingDataAccessor = this.dataAccessor;

    this.dataSource.filterPredicate = (data: (CompleteObject | CompleteObjectWithUser), search: string) =>
      ['name']
        .map(s => this.dataAccessor(data, s))
        .join(' ').toLowerCase().includes(search.toLowerCase());
  }

}
