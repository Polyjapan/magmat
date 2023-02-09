import {Component, OnInit} from '@angular/core';
import {CompleteExternalLoan, LoanState} from '../../data/external-loan';
import {CompleteObject, ObjectStatus} from '../../data/object';
import {LoansService} from '../../services/stateful/loans.service';
import {ObjectsService} from '../../services/stateful/objects.service';
import { ReturnsService } from "./returns.service";

@Component({
  selector: 'app-returns',
  templateUrl: './returns.component.html',
  styleUrls: ['./returns.component.css']
})
export class ReturnsComponent implements OnInit {
  loans: CompleteExternalLoan[];
  loansItems = new Map<number, CompleteObject[]>();

  constructor(private ls: LoansService, private returns: ReturnsService) {
  }

  ngOnInit() {
    this.ls.loans$.subscribe(loans => {
      this.loans = loans
        .filter(elem => elem.externalLoan.status === LoanState.AWAITING_RETURN) // get only last
        .map(elem => {
          elem.externalLoan.returnTime = new Date(Date.parse(elem.externalLoan.returnTime as any as string));
          return elem;
        })
        .sort((a, b) => a.externalLoan.returnTime.valueOf() - b.externalLoan.returnTime.valueOf());

      this.loans.map(l => l.externalLoan.externalLoanId)
        .forEach(loanId => {
          this.returns.getObjectsInLoan(loanId).subscribe(objects => {
            const objList = objects.filter(o => o.object.status !== ObjectStatus.IN_STOCK);

            this.loansItems.set(loanId, objList);
          });
        });
    });
  }

}
