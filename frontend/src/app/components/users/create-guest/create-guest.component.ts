import {Component, Inject, OnInit} from '@angular/core';
import {Guest} from '../../../data/guest';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import {GuestsService} from '../../../services/guests.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-create-guest',
  templateUrl: './create-guest.component.html',
  styleUrls: ['./create-guest.component.css']
})
export class CreateGuestComponent implements OnInit {
  lender: Guest;
  sending = false;

  constructor(private dialogRef: MatDialogRef<CreateGuestComponent>, private ls: GuestsService, @Inject(MAT_DIALOG_DATA) private data?: Guest) {
    if (data) {
      this.lender = data;
    } else {
      this.lender = new Guest();
    }
  }

  ngOnInit() {
  }

  get isUpdate(): boolean {
    return this.lender.guestId !== null && this.lender.guestId !== undefined;
  }

  submit($event: any) {
    if (this.isUpdate) {
      alert('Not implemented!');
      return;
    }

    if (this.sending) {
      return;
    }
    this.sending = true;

    this.ls.createGuest(this.lender).subscribe(res => {
      this.dialogRef.close(res);
    }, err => {
      this.sending = false;
      Swal.fire('Il y a eu un problème', undefined, 'error');
    });
  }
}
