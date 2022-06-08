import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {Guest} from '../../../data/guest';
import {GuestsService} from '../../../services/guests.service';
import { MatDialog } from '@angular/material/dialog';
import {CreateGuestComponent} from '../../users/create-guest/create-guest.component';

@Component({
  selector: 'app-select-lender',
  templateUrl: './select-lender.component.html',
  styleUrls: ['./select-lender.component.css']
})
export class SelectLenderComponent implements OnInit {
  @Input() label = 'Identité du prêteur';
  @Input() emptyLabel = 'Aucun';
  @Input() allowCreation = false;
  @Input() selected: number;

  @Output() selectedChange = new EventEmitter<number>();
  @Output() selectedLenderChange = new EventEmitter<Guest>();

  lenders: Guest[] = [];
  constructor(private service: GuestsService, private dialog: MatDialog) { }

  ngOnInit() {
    this.service.getGuests().subscribe(lenders => {
      this.lenders = lenders;
    });
  }

  displayLender(lender?: Guest): string | undefined {
    return lender ? lender.name + ' (' + lender.location + ')' : undefined;
  }

  changeValue($event) {
    this.selectedChange.emit($event);
    this.selectedLenderChange.emit(this.lenders.filter(l => l.guestId === $event)[0]);
  }

  create() {
    this.dialog.open(CreateGuestComponent).afterClosed().subscribe(res => {
      if (typeof res === 'number') {
        let messages = 0;
        const subscriber = this.service.getGuests().subscribe(ans => {
          messages ++;
          if (messages === 2) {
            subscriber.unsubscribe();
            this.selected = res;
            this.changeValue(res);
          }
        });
        this.service.refreshGuests();
      }
    });
  }
}
