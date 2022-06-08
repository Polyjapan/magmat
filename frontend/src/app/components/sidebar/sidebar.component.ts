import {Component, Input, OnInit} from '@angular/core';
import {EventsService} from '../../services/events.service';
import {map, tap} from 'rxjs/operators';
import {Observable} from 'rxjs';

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.css']
})
export class SidebarComponent implements OnInit {

  @Input('url') subUrl: string;
  inEvent: Observable<boolean>;

  constructor(private events: EventsService) {
    this.inEvent = events.getCurrentEvent().pipe(map(e => e !== null), tap(b => console.log("received " + b)));
  }

  ngOnInit() {
  }

}
