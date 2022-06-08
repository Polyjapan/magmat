import {Component, OnInit} from '@angular/core';
import {ExternalLoan, LoanState, LoanStates, loanStateToText} from '../../../data/external-loan';
import {Guest} from '../../../data/guest';
import {LoansService} from '../../../services/loans.service';
import {Router} from '@angular/router';
import Swal from 'sweetalert2';
import {EventsService} from '../../../services/events.service';

@Component({
  selector: 'app-create-external-loan',
  templateUrl: './create-external-loan.component.html',
  styleUrls: ['./create-external-loan.component.css']
})
export class CreateExternalLoanComponent implements OnInit {
  loan: ExternalLoan;
  lender: Guest;
  eventId: number;

  sending = false;

  constructor(private ls: LoansService, private router: Router, private es: EventsService) {
  }

  get isUpdate(): boolean {
    return this.loan.externalLoanId !== undefined && this.loan.externalLoanId !== null;
  }

  get isValid() {
    return this.loan && this.loan.guestId && this.loan.returnTime && this.loan.pickupTime && this.eventId && this.loan.loanTitle;
  }

  ngOnInit() {
    this.resetLoan();
    this.es.getCurrentEvent().subscribe(ev => {
      if (ev) {
        this.eventId = ev.id;
      }
    });
  }

  resetLoan() {
    this.loan = new ExternalLoan();
    this.loan.status = LoanState.AWAITING_PICKUP;
  }

  submit(type: 'see' | 'edit-new') {
    if (!this.isValid) {
      return;
    }

    if (this.sending) {
      return;
    }
    this.sending = true;

    this.loan.eventId = this.eventId;

    this.ls.createLoan(this.loan)
      .subscribe(res => {
        if (type === 'see') {
          this.ls.forceRefreshLoans();
          this.router.navigate(['/', 'external-loans', res]);
        } else {
          Swal.fire('Prêt créé', undefined, 'success');
          this.resetLoan();
          this.sending = false;
        }
      }, err => {
        Swal.fire('Une erreur s\'est produite', undefined, 'error');
        this.sending = false;
      });
  }

}
