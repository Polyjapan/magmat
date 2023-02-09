import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {ViewUserService} from '../../users/view-user/view-user.service';
import {UserProfile} from '../../../data/user';
import {merge, Observable, partition} from 'rxjs';
import {debounceTime, distinctUntilChanged, filter, map, startWith, switchMap, tap} from 'rxjs/operators';
import {FormControl} from '@angular/forms';
import {Guest} from '../../../data/guest';
import {GuestsService} from '../../../services/guests.service';
import has = Reflect.has;
import {of} from 'rxjs/internal/observable/of';
import {AbstractSelectorComponent} from '../abstract-selector/abstract-selector.component';
import {UsersService} from '../../../services/stateful/users.service';

@Component({
  selector: 'app-select-user',
  templateUrl: '../abstract-selector/abstract-selector.component.html',
  styleUrls: ['./select-user.component.css']
})
export class SelectUserComponent extends AbstractSelectorComponent<UserProfile | Guest>{
  private userGuestDiscriminant = 0x1000000; // 6 bytes == 2^48 = enough

  autoSelect = true;

  @Input() label = 'Choisir un utilisateur';
  @Input() userId: number;

  @Input() allowGuests = true;

  @Output() userIdChange = this.selectedChange.pipe(filter(id => id < this.userGuestDiscriminant));
  @Output() selectedUser = this.selectedObjectChange;

  constructor(private service: UsersService, private guests: GuestsService) {
    super();
  }

  defaultLabel = 'ID utilisateur ou recherche';

  toIdentifierString(v: UserProfile | Guest): string | undefined {
    if (has(v, 'guestId')) {
      return 'g' + (v as Guest).guestId;
    } else if ((v as UserProfile).staffNumber) {
      return 's' + (v as UserProfile).staffNumber;
    } else {
      return '' + (v as UserProfile).id;
    }
  }

  displayValue(val: [number, (UserProfile | Guest)] | undefined): string | undefined {
    if (val) {
      const v = val[1];
      if (has(v, 'guestId')) {
        const guest = v as Guest;
        return 'Invité ' + guest.guestId + ' : ' + guest.name + ' ' + (guest.organization ?? '') + ' ' + (guest.email ?? '');
      } else {
        const user = v as UserProfile;
        if (user.staffNumber) {
          return 'Staff #' + user.staffNumber + ' : ' + user.details.firstName + ' ' + user.details.lastName;
        } else {
          return 'Utilisateur #' + user.id + ' : ' + user.details.firstName + ' ' + user.details.lastName;
        }
      }
    }
    return undefined;
  }

  getId(v: UserProfile | Guest | undefined): number | undefined {
    if (v) {
      if (has(v, 'guestId')) {
        return (v as Guest).guestId | 0x100000;
      } else {
        return (v as UserProfile).id;
      }
    }
    return undefined;
  }

  getPossibleValues(): Observable<(UserProfile | Guest)[]> {
    if (this.allowGuests) {
      return this.service.users$
        .pipe(
          switchMap(users =>
            this.guests.getGuests()
              .pipe(map(guests => {
                const arr = users as (UserProfile | Guest)[];
                guests.forEach(g => arr.push(g));
                return arr;
              }))
          )
        );
    } else {
      return this.service.users$;
    }
  }

  toSearchableString(v: UserProfile | Guest): string {
    if (v) {
      if (has(v, 'guestId')) {
        const guest = v as Guest;
        return guest.guestId + ' ' + guest.name + ' ' + guest.organization + ' ' + guest.email +
          ' ' + guest.location + ' ' + guest.description;
      } else {
        const user = v as UserProfile;
        return 's' + (user.staffNumber ?? '') + ' ' + user.id + ' ' + user.details.firstName +
          ' ' + user.details.lastName + ' ' + user.email;
      }
    }
    return undefined;
  }
}
