import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {CompleteExternalLoan} from '../../../data/external-loan';
import {LoansService} from '../../../services/stateful/loans.service';
import {Observable} from 'rxjs';
import {map} from 'rxjs/operators';
import {AbstractSelectorComponent} from '../abstract-selector/abstract-selector.component';

@Component({
  selector: 'app-select-loan',
  templateUrl: '../abstract-selector/abstract-selector.component.html',
  styleUrls: ['./select-loan.component.css']
})
export class SelectLoanComponent extends AbstractSelectorComponent<CompleteExternalLoan> {
  @Input('type') type: 'select' | 'input' = 'select';

  constructor(private service: LoansService) { super() }

  defaultLabel: string = 'Lien du prêt';

  displayValue(val: [number, CompleteExternalLoan] | undefined): string | undefined {
    if (!val) return undefined;

    const loan = val[1];
    const name = loan.guest ? loan.guest.name : loan.user.email;
    return loan ? (loan.guest ? 'Prêt ' + loan.externalLoan.loanTitle + ' (' + name + ')' +
      ' récupéré le ' + loan.externalLoan.pickupTime : undefined) : undefined;
  }

  getId(v: CompleteExternalLoan | undefined): number | undefined {
    return v?.externalLoan?.externalLoanId;
  }

  getPossibleValues(): Observable<CompleteExternalLoan[]> {
    return this.service.loans$;
  }

  toSearchableString(v: CompleteExternalLoan): string {
    return v ? v.externalLoan.loanTitle + ' ' + (v.guest?.name ?? v.user?.email) : undefined;
  }

}
