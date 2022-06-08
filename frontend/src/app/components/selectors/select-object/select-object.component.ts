import {Component} from '@angular/core';
import {Observable} from 'rxjs';
import {CompleteObject} from '../../../data/object';
import {ObjectsService} from '../../../services/objects.service';
import {AbstractSelectorComponent} from '../abstract-selector/abstract-selector.component';

@Component({
  selector: 'app-select-object',
  templateUrl: '../abstract-selector/abstract-selector.component.html',
  styleUrls: ['./select-object.component.css']
})
export class SelectObjectComponent extends AbstractSelectorComponent<CompleteObject> {

  defaultLabel: string = 'Choisir un objet (asset tag ou nom)';

  autoSelect = true;

  constructor(private service: ObjectsService) {
    super();
  }

  toSearchableString(v: CompleteObject): string {
    return v ? (v.object.assetTag ?? '') + ' ' + v.objectType.name + ' ' + v.object.suffix : undefined;
  }

  getPossibleValues(): Observable<CompleteObject[]> {
    return this.service.getObjects();
  }

  getId(v: CompleteObject): number {
    return v?.object?.objectId;
  }

  displayValue(val?: [number, CompleteObject]): string {
    const v = val ? val[1] : undefined;
    return v ? v.objectType.name + ' ' + v.object.suffix + ' (' + (v.object.assetTag ?? 'no tag') + ')' : undefined;
  }

  /*
  @Input() label = 'Choisir un objet';
  @Output() selectedObject = new EventEmitter<CompleteObject>();
  @Input() selected: string;
  @Output() selectedChange = new EventEmitter<string>();

  @ViewChild('input', {static: true}) inputElement: NgModel;

  currentObject: CompleteObject;
  private inputSubscriber: Subscriber<string>;
  private inputObservable = new Observable<string>(subscriber => this.inputSubscriber = subscriber);

  constructor(private service: ObjectsService) {
  }

  ngOnInit() {
    this.inputObservable
      .pipe(
        filter(text => text !== null && text != undefined),
        filter(text => text.length >= 1),
        debounceTime(200)
      ).subscribe(val => {
      this.service.getObjectByTag(val).subscribe(data => {
        this.selectedObject.emit(data);
        this.currentObject = data;
        this.inputElement.control.setErrors(null);
      }, err => this.inputElement.control.setErrors({noObject: true}));
    });
  }

  update($event: string) {
    this.selectedChange.emit($event);
    this.selectedObject.emit(undefined);
    this.currentObject = undefined;
    if (this.inputSubscriber) {
      this.inputSubscriber.next($event);
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.selected) {
      this.update(changes.selected.currentValue as string);
    }
  }*/
}
