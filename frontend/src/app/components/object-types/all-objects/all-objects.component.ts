import {Component, OnInit} from '@angular/core';
import {ObjectsService} from '../../../services/stateful/objects.service';
import {CompleteObject} from '../../../data/object';
import {Observable} from 'rxjs';
import {debounceTime} from 'rxjs/operators';
import { MatSnackBar } from "@angular/material/snack-bar";
import { ExportsService } from "../../../services/exports.service";

@Component({
  selector: 'app-all-objects',
  templateUrl: './all-objects.component.html',
  styleUrls: ['./all-objects.component.css']
})
export class AllObjectsComponent implements OnInit {
  objects$: Observable<CompleteObject[]>;

  downloading?: boolean = false;

  constructor(private objects: ObjectsService,
              private snack: MatSnackBar,
              private exports: ExportsService) {
    // adding the debounce gives some time to the browser to render the page before the content arrives, making the experience more fluid
    this.objects$ = objects.objects$.pipe(debounceTime(200));
  }

  ngOnInit(): void {
  }


  async export() {
    this.downloading = true;

    try {
      await this.exports.exportAll()
    } catch (err) {
      console.error('Export download failed', err)
      this.snack.open('Erreur : Impossible de télécharger l\'export', undefined, {duration: 1500})
    }
    this.downloading = false;
  }
}
