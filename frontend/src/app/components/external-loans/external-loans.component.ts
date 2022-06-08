import {Component, OnInit} from '@angular/core';
import {Observable} from 'rxjs';
import {CompleteExternalLoan, LoanState, loanStateToText, loanStateToColor} from '../../data/external-loan';
import {LoansService} from '../../services/loans.service';

@Component({
  selector: 'app-external-loans',
  templateUrl: './external-loans.component.html',
  styleUrls: ['./external-loans.component.css']
})
export class ExternalLoansComponent implements OnInit {
  loans: Observable<CompleteExternalLoan[]>;

  constructor(private ls: LoansService) { }

  ngOnInit() {
    this.loans = this.ls.getLoans();
  }

  loanStateToText = loanStateToText;
  loanStateToColor = loanStateToColor;

  dateFormat(date) {
    if (typeof date === 'string') {
      return new Date(Date.parse(date)).toLocaleString();
    } else {
      return date.toLocaleString();
    }
  }

  isLate(loan: CompleteExternalLoan) {
    const now = Date.now()
    const date = typeof loan.externalLoan.returnTime === 'string' ? new Date(Date.parse(loan.externalLoan.returnTime as string)) : loan.externalLoan.returnTime

    return loan.externalLoan.status === LoanState.AWAITING_RETURN && date.getTime() < now;
  }

}
