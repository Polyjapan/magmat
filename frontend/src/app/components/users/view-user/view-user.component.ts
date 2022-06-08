import {Component, OnInit} from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import {Observable} from 'rxjs';
import {map, switchMap} from 'rxjs/operators';
import {Guest} from '../../../data/guest';
import {GuestsService} from '../../../services/guests.service';
import {ProfileService} from '../../../services/profile.service';
import {UserProfile} from '../../../data/user';

@Component({
  selector: 'app-view-user',
  templateUrl: './view-user.component.html',
  styleUrls: ['./view-user.component.css']
})
export class ViewUserComponent implements OnInit {
  id: number;
  isGuest: boolean;
  guest$: Observable<Guest>;
  user$: Observable<UserProfile>;

  constructor(private guests: GuestsService,
              private users: ProfileService,
              private ar: ActivatedRoute) {
  }

  ngOnInit() {
    this.ar.paramMap.pipe(
      switchMap(urlParams => this.ar.data.pipe(map(data => [urlParams, data])))
    ).subscribe(params => {
      const paramMap = params[0];
      const data = params[1];

      this.isGuest = (data.isGuest === true);

      this.id = Number.parseInt(paramMap.get('id'), 10);

      if (this.isGuest) {
        this.guest$ = this.guests.getGuest(this.id);
      } else {
        this.user$ = this.users.getUser(this.id);
      }

    });
  }
}
