import {Guest} from './guest';
import {UserProfile} from './user';

export enum LoanState {
  AWAITING_PICKUP = 'AwaitingPickup',
  AWAITING_RETURN = 'AwaitingReturn',
  RETURNED = 'Returned'
}

export const LoanStates = [LoanState.AWAITING_RETURN, LoanState.AWAITING_PICKUP, LoanState.RETURNED];

export function loanStateToText(loanState: LoanState, isLate?: boolean) {
  switch (loanState) {
    case LoanState.AWAITING_PICKUP:
      return 'À récupérer';
    case LoanState.AWAITING_RETURN:
      return isLate ? 'À rendre' : 'En stock';
    case LoanState.RETURNED:
      return 'Rendu';
    default:
      return 'Etat inconnu ' + loanState;
  }
}

export function loanStateToColor(loanState: LoanState, isLate?: boolean) {
  switch (loanState) {
    case LoanState.AWAITING_PICKUP:
      return 'warning';
    case LoanState.AWAITING_RETURN:
      return isLate ? 'danger' : 'info';
    case LoanState.RETURNED:
      return 'success';
    default:
      return 'danger';
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
