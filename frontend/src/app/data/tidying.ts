import {CompleteObject, SingleObject} from './object';
import {CompleteExternalLoan, ExternalLoan} from './external-loan';
import {Storage} from './storage-location';

export class GenericTidyingTree<T> {
  storage?: Storage;
  loan?: CompleteExternalLoan;

  leaf?: T[];
  node?: GenericTidyingTree<T>[];
}

export class TidyingTree extends GenericTidyingTree<GenericTidyingTree<SingleObject[]>> {}

export class TopTidyingTree {
  stored: Map<string, Map<string, Map<string, TidyingLeaf>>>;
  unstored: TidyingLeaf;
  loaned: TopLoanLeaf[];
}

export class TopLoanLeaf {
  loan: CompleteExternalLoan;
  objects: TidyingLeaf;
}

export class TidyingLeaf {
  stored: Map<string, Map<string, Map<string, CompleteObject[]>>>;
  other: CompleteObject[];
  loaned: TidyingLeafLoan[];
}

export class TidyingLeafLoan {
  loan: CompleteExternalLoan;
  objects: CompleteObject[];
}
