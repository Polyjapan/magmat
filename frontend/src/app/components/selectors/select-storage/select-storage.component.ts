import {Component, Input, SimpleChanges} from '@angular/core';
import {lastChild, objectHasParentLocation, storageLocationToString, StorageTree} from '../../../data/storage-location';
import {StorageLocationsService} from '../../../services/stateful/storage-locations.service';
import {Observable} from 'rxjs';
import {map} from 'rxjs/operators';
import {AbstractSelectorComponent} from '../abstract-selector/abstract-selector.component';

@Component({
  selector: 'app-select-storage',
  templateUrl: '../abstract-selector/abstract-selector.component.html',
  styleUrls: ['./select-storage.component.css']
})
export class SelectStorageComponent extends AbstractSelectorComponent<StorageTree> {
  @Input('inconv') inconv: boolean = undefined;
  @Input() excludeChildrenOf: number;
  defaultLabel = 'Lieu de rangement';

  constructor(private service: StorageLocationsService) {
    super();
  }

  ngOnChanges(changes: SimpleChanges): void {
    super.ngOnChanges(changes);

    if (changes.inConv !== undefined) {
      // TODO: probably does nothing
      this.searchControl.setValue(this.searchControl.value);
    }
  }


  toSearchableString(v: StorageTree): string {
    return storageLocationToString(v, undefined);
  }

  getPossibleValues(): Observable<StorageTree[]> {
    return this.service.getStoragesWithParents(this.inconv)
      .pipe(
        map(m => Array.from(m.values()).filter(el => (!this.excludeChildrenOf || !objectHasParentLocation(el, this.excludeChildrenOf)))));
  }

  getId(v: StorageTree): number {
    return lastChild(v)?.storageId;
  }


  displayValue(val?: [number, StorageTree]): string {
    return (val ? storageLocationToString(val[1], undefined) : undefined) ?? this.emptyLabel;
  }
}


