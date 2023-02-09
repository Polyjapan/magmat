import {Component, OnInit} from '@angular/core';
import {Observable} from 'rxjs';
import {EventsService} from '../../../services/stateful/events.service';
import {Event} from '../../../data/event';
import { take } from "rxjs/operators";

@Component({
  selector: 'app-event-selector',
  templateUrl: './event-selector.component.html',
  styleUrls: ['./event-selector.component.css']
})
export class EventSelectorComponent implements OnInit {
  events$: Observable<Event[]>;
  event: Observable<Event>;

  constructor(private events: EventsService) {
    this.events$ = events.events$
    this.event = events.currentEvent$
  }

  ngOnInit() {
  }

  async switch(id: number) {
    await this.events.switchEvent(id).pipe(take(1)).toPromise()
    // window.location.reload()
  }
}
