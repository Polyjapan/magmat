import { Component, OnInit } from '@angular/core';
import {environment} from '../../../../environments/environment';

@Component({
  selector: 'app-require-login',
  templateUrl: './require-login.component.html',
  styleUrls: ['./require-login.component.css']
})
export class RequireLoginComponent implements OnInit {
  private service = window.location.origin;

  url = environment.auth.apiurl + '/cas/login?service=' + this.service;

  constructor() { }

  ngOnInit() {
    window.location.replace(this.url);
  }

}
