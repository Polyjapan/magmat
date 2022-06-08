import {AfterViewInit, Component, ElementRef, EventEmitter, OnInit, Output, ViewChild} from '@angular/core';
import {SignaturePad} from 'angular2-signaturepad';

@Component({
  selector: 'app-signing-area',
  templateUrl: './signing-area.component.html',
  styleUrls: ['./signing-area.component.css']
})
export class SigningAreaComponent implements AfterViewInit {
  @ViewChild('sigContainer', {static: true}) public sigContainer: ElementRef;
  @ViewChild('sig', {static: true}) public sigField: SignaturePad;

  @Output() public hasSigned = new EventEmitter<boolean>();
  @Output() public signature = new EventEmitter<string>();

  constructor() { }

  public size(container: ElementRef, sig: SignaturePad) {
    console.log(container);
    console.log(sig);

    sig.set('canvasWidth', container.nativeElement.clientWidth);
    sig.set('canvasHeight', container.nativeElement.clientHeight);
  }

  ngAfterViewInit() {
    this.size(this.sigContainer, this.sigField);
  }

  reset() {
    this.hasSigned.emit(false);
    this.signature.emit(undefined);
  }

  public get isEmpty() {
    return this.sigField.isEmpty();
  }

  public get signatureData() {
    return this.sigField.toData();
  }

  public get signatureImage() {
    return this.sigField.toDataURL();
  }

  public drawComplete(): void {
    this.hasSigned.emit(!this.isEmpty);
    this.signature.emit(this.signatureImage);
  }
}
