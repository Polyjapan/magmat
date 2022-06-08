import {Component, OnInit} from '@angular/core';
import {Observable} from 'rxjs';
import {Guest} from '../../data/guest';
import {GuestsService} from '../../services/guests.service';
import {CreateGuestComponent} from './create-guest/create-guest.component';
import {MatDialog} from '@angular/material/dialog';

@Component({
  selector: 'app-guests',
  templateUrl: './guests.component.html',
  styleUrls: ['./guests.component.css']
})
export class GuestsComponent implements OnInit {
  guests$: Observable<Guest[]>;

  constructor(private gs: GuestsService, private dialog: MatDialog) {
  }

  ngOnInit() {
    this.guests$ = this.gs.getGuests();
  }

  refresh() {
    this.gs.refreshGuests();
  }

  create() {
    this.dialog.open(CreateGuestComponent).afterClosed().subscribe(res => {
      if (res) {
        this.gs.refreshGuests();
      }
    });
  }
}
