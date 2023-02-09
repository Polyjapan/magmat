import { AfterViewInit, Component, Input, OnChanges, ViewChild } from '@angular/core';
import { CompleteObject, ObjectStatus, statusToString } from '../../../data/object';
import { storageLocationToString } from 'src/app/data/storage-location';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { normalizeString } from '../../../utils/normalize.string';
import { Event } from '../../../data/event';
import { EventsService } from '../../../services/stateful/events.service';

@Component({
  selector: 'app-objects-list',
  templateUrl: './objects-list.component.html',
  styleUrls: ['./objects-list.component.css']
})
export class ObjectsListComponent implements OnChanges, AfterViewInit {
  @Input() fullWidth: boolean = false;
  @Input() objects: CompleteObject[];

  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort, { static: true }) sort: MatSort;
  dataSource: MatTableDataSource<CompleteObject> = new MatTableDataSource();

  event: Event;

  constructor(private eventService: EventsService) {
    eventService.currentEvent$.subscribe(ev => this.event = ev);
  }

  get columns() {
    const hasUsers = this.objects.filter(o => !!o.user).length > 0;
    const hasStorage = this.objects.filter(o => !!o.storageLocationObject || !!o.inconvStorageLocationObject).length > 0;
    const hasPlannedUse = this.event && this.objects.filter(o => !!o.object.plannedUse).length > 0;
    const hasReservedFor = this.event && this.objects.filter(o => !!o.reservedFor).length > 0;
    const base = ['assetTag', 'name'];

    if (hasStorage) {
      base.push('storage')
    }

    if (hasPlannedUse) {
      base.push('plannedUse')
    }

    if (hasReservedFor) {
      base.push('reservedFor')
    }

    base.push('status');
    if (hasUsers) {
      base.push('user');
    }

    // TODO: Louis - I don't like the look of this table with the edit button, but if edit is frequently needed then we may need to put this back
    // base.push('actions');
    return base;

  }

  ngAfterViewInit() {
    this.dataSource.sort = this.sort;
    this.dataSource.paginator = this.paginator;

    this.dataSource.sortingDataAccessor = this.dataAccessor;

    this.dataSource.filterPredicate = (data: CompleteObject, search: string) => {
      const query = normalizeString(search.toLowerCase());
      const element = normalizeString(['assetTag', 'name', 'reservedFor', 'user'].map(s => this.dataAccessor(data, s)).join(' ').toLowerCase());

      return !query.split(' ').find(word => !element.includes(word))
    }


    this.ngOnChanges({});
  }

  dataAccessor(o: CompleteObject, column: string): string {
    switch (column) {
      case 'user':
        const user = o.user;
        return user && (o.object.status === ObjectStatus.OUT || o.object.status === ObjectStatus.RESTING) ? user.details.firstName + ' ' + user.details.lastName : '';
      case 'status':
        // Only for sorting
        return statusToString(o.object.status);
      case 'storage':
        return storageLocationToString(!this.event ? o.storageLocationObject : o.inconvStorageLocationObject);
      case 'name':
        return o?.objectType?.name + ' ' + o.object.suffix;
      case 'reservedFor':
        return o.reservedFor ? o.reservedFor.details.firstName + ' ' + o.reservedFor.details.lastName : '';
      default:
        return o.object[column];
    }
  }

  ngOnChanges(changes) {
    this.dataSource.data = this.objects;
  }

}
