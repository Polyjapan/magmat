import {Component, OnInit} from '@angular/core';
import {ObjectsService} from '../../../services/stateful/objects.service';
import {CompleteObject} from '../../../data/object';
import {Observable} from 'rxjs';
import {debounceTime} from 'rxjs/operators';

@Component({
  selector: 'app-all-objects',
  templateUrl: './all-objects.component.html',
  styleUrls: ['./all-objects.component.css']
})
export class AllObjectsComponent implements OnInit {
  objects$: Observable<CompleteObject[]>;

  constructor(private objects: ObjectsService) {
    // adding the debounce gives some time to the browser to render the page before the content arrives, making the experience more fluid
    this.objects$ = objects.objects$.pipe(debounceTime(200));
  }

  ngOnInit(): void {
  }

}
