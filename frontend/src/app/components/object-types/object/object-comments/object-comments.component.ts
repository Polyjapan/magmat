import { Component, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { ObjectCommentsService } from "./object-comments.service";
import { Observable } from "rxjs";
import { CompleteObjectComment } from "../../../../data/object-comment";

@Component({
  selector: 'app-object-comments',
  templateUrl: './object-comments.component.html',
  styleUrls: ['./object-comments.component.css']
})
export class ObjectCommentsComponent implements OnChanges {
  @Input() id: number;

  comments$: Observable<CompleteObjectComment[]>
  sending: boolean = false;
  comment: string;

  constructor(private service: ObjectCommentsService) {
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.id) {
      this.comments$ = this.service.getObjectComments(this.id);
    }
  }

  sendComment() {
    if (this.sending) {
      return;
    }

    this.sending = true;
    this.service.postObjectComment(this.id, this.comment)
      .subscribe(success => {
        this.sending = false;
        this.comment = '';
      }, err => {
        this.sending = false
      });
  }

}
