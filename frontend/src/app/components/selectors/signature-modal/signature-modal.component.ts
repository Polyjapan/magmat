import {Component, Inject, OnInit} from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import {StorageLocationsService} from '../../../services/storage-locations.service';

@Component({
  selector: 'app-signature-modal',
  templateUrl: './signature-modal.component.html',
  styleUrls: ['./signature-modal.component.css']
})
export class SignatureModalComponent implements OnInit {
  signature: string = undefined;
  displayAction: string;


  constructor(
    public dialogRef: MatDialogRef<SignatureModalComponent>,
    @Inject(MAT_DIALOG_DATA) displayAction: string
  ) {
    this.displayAction = displayAction;
  }

  ngOnInit() {
  }

  validate() {
    if (this.signature) {
      this.dialogRef.close(this.signature);
    }
  }
}
