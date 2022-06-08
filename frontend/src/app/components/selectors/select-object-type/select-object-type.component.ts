import {Component, Input} from '@angular/core';
import {lastChild, objectHasParentObjectType, ObjectTypeAncestry, objectTypeToString} from '../../../data/object-type';
import {Observable} from 'rxjs';
import {map} from 'rxjs/operators';
import {ObjectTypesService} from '../../../services/object-types.service';
import {AbstractSelectorComponent} from '../abstract-selector/abstract-selector.component';

@Component({
  selector: 'app-select-object-type',
  templateUrl: '../abstract-selector/abstract-selector.component.html',
  styleUrls: ['./select-object-type.component.css']
})
export class SelectObjectTypeComponent extends AbstractSelectorComponent<ObjectTypeAncestry> {
  @Input() excludeChildrenOf: number;
  defaultLabel: string = 'Choisissez une catégorie d\'objets...';

  constructor(private os: ObjectTypesService) {
    super();
  }

  toSearchableString(v: ObjectTypeAncestry): string {
    return objectTypeToString(v, undefined);
  }

  getPossibleValues(): Observable<ObjectTypeAncestry[]> {
    return this.os.getObjectTypesWithParents()
      .pipe(map(m => Array.from(m.values())
        .filter(el => !this.excludeChildrenOf || !objectHasParentObjectType(el, this.excludeChildrenOf))));
  }

  getId(v: ObjectTypeAncestry): number {
    return lastChild(v)?.objectTypeId;
  }

  displayValue(val?: [number, ObjectTypeAncestry]): string {
    return (val ? objectTypeToString(val[1], undefined) : undefined) ?? undefined;
  }

  /**
   * @deprecated
   */
  refreshTypes() {
    this.refresh();
  }

}
