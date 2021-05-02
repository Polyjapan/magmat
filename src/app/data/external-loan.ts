import {Guest} from './guest';
import {UserProfile} from './user';

export enum LoanState {
  AWAITING_PICKUP = 'AwaitingPickup',
  AWAITING_RETURN = 'AwaitingReturn',
  RETURNED = 'Returned'
}

export const LoanStates = [LoanState.AWAITING_RETURN, LoanState.AWAITING_PICKUP, LoanState.RETURNED];

export function loanStateToText(loanState: LoanState) {
  switch (loanState) {
    case LoanState.AWAITING_PICKUP:
      return 'Non récupéré';
    case LoanState.AWAITING_RETURN:
      return 'Récupéré, non retourné';
    case LoanState.RETURNED:
      return 'Retourné et clos';
    default:
      return 'Etat inconnu ' + loanState;
  }
}

export function externalLoanToString(loan: CompleteExternalLoan, defaultValue: string = '') {
  if (loan) {
    return loan.externalLoan.loanTitle + ' (' + loan.guest.location + ')';
  }
  return defaultValue;
}

export class ExternalLoan {
  externalLoanId?: number;
  guestId?: number;
  userId?: number;
  eventId: number;
  loanTitle: string;
  pickupTime: Date;
  returnTime: Date;
  pickupPlace?: string;
  returnPlace?: string;
  loanDetails: string;
  status: LoanState;
}

export class CompleteExternalLoan {
  externalLoan: ExternalLoan;
  guest?: Guest;
  user?: UserProfile;
}
