import {Injectable} from '@angular/core';
import {JwtHelperService} from '@auth0/angular-jwt';
import {Router, UrlTree} from '@angular/router';
import {environment} from '../../environments/environment';

export class UserSession {
  groups: string[];
  userId: number;
}

@Injectable({
  providedIn: 'root',
})
export class AuthService {

  constructor(private jwtHelper: JwtHelperService, private route: Router) {
  }

  login(token: string): UrlTree {
    localStorage.setItem('id_token', token);
    let act = this.loadNextAction();

    if (!act || act.startsWith('/?ticket=')) {
      act = '/';
      // force the event ID to refresh... simpler than to break the bad code
      window.location.reload();
    }

    return this.route.createUrlTree([act]);
  }

  requiresLogin(redirectTo: string): boolean {
    if (this.isAuthenticated()) {
      return true;
    } else {
      this.storeNextAction(redirectTo);
      return false;
    }
  }

  requiresGroup(redirectTo: string, group: string): boolean {
    if (this.requiresLogin(redirectTo)) {
      return this.hasGroup(group);
    }
    return false;
  }

  private storeNextAction(action: string) {
    localStorage.setItem('_post_login_action', action);
  }

  public changeToken(token: string) {
    localStorage.setItem('id_token', token);
  }

  private loadNextAction(): string {
    const act = localStorage.getItem('_post_login_action');
    localStorage.removeItem('_post_login_action');

    return act;
  }

  public logout(): void {
    // Remove tokens and expiry time from localStorage
    localStorage.removeItem('id_token');

    window.location.replace(environment.auth.apiurl + '/logout?app=' + environment.auth.clientId);
  }

  get rawToken() {
    return localStorage.getItem('id_token')
  }

  public getToken(): UserSession {
    const token = this.rawToken
    const decoded = this.jwtHelper.decodeToken(token);

    if (decoded && decoded.user) {
      return decoded.user as UserSession;
    } else {
      return null;
    }
  }

  public hasGroup(group: string): boolean {
    const token = this.getToken();
    if (this.isAuthenticated() && token) {
      return token.groups.indexOf(group) !== -1;
    } else {
      return false;
    }
  }

  public isAuthenticated(): boolean {
    const token = localStorage.getItem('id_token');

    if (token === null) {
      return false;
    }

    try {
      return !this.jwtHelper.isTokenExpired(token);
    } catch (e) {
      console.log(e);
      return false;
    }
  }
}
