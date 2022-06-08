import { MatDialog } from '@angular/material/dialog';
import {CompleteObject} from '../data/object';
import {SignatureModalComponent} from '../components/selectors/signature-modal/signature-modal.component';
import Swal from "sweetalert2";

export function requestSignature(dialog: MatDialog, what: string, success: (signature: string) => void, failure: () => void) {
  // Retour en stock ou sortie de stock.
  const text = 'Emprunt de ' + what;
  dialog.open(SignatureModalComponent, {data: text})
    .afterClosed()
    .subscribe(res => {
      if (res && typeof res === 'string') {
        success(res);

      } else {
        Swal.fire('Eh non!', 'Impossible de faire ça, il te faut signer mon dude.', 'error');
        failure();
      }
    });
}
