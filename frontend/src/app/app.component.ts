import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import {AuthService} from './services/auth.service';
import {BreakpointObserver, Breakpoints, MediaMatcher} from '@angular/cdk/layout';
import {RouterOutlet} from '@angular/router';
import {map, shareReplay} from 'rxjs/operators';
import {Observable} from 'rxjs';
import { SseService, SSEStatus } from "./services/sse.service";
import { RefreshAllService } from "./services/refresh-all.service";

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'inventory';
  subUrl: string;

  sseStatus$: Observable<SSEStatus>;
  SSEStatus = SSEStatus


  isHandset$: Observable<boolean> = this.breakpointObserver.observe(Breakpoints.Handset)
    .pipe(
      map(result => result.matches),
      shareReplay()
    );

  constructor(private breakpointObserver: BreakpointObserver, private auth: AuthService, private sse: SseService, public refresh: RefreshAllService) {
    this.sseStatus$ = this.sse.status
  }

  activateRoute(event, elem: RouterOutlet) {
    this.subUrl = elem.activatedRoute.snapshot.routeConfig.path;
  }

  logout() {
    this.auth.logout();
  }

  get isLoggedIn() {
    return this.auth.isAuthenticated();
  }
}
