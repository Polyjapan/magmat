// This file can be replaced during build by using the `fileReplacements` array.
// `ng build --prod` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

export const environment = {
  production: false,

  apiurl: 'http://localhost:9000',
  apidomain: 'localhost:9000',
  baseUrl: 'http://localhost:4200',

  auth: {
    apiurl: 'https://auth.japan-impact.ch',
    clientId: '3lHGENIo0Kn0s1ynR2Q508E3ae000PLkIcgrNtKsUGs'
  },
};

/*
 * For easier debugging in development mode, you can import the following file
 * to ignore zone related error stack frames such as `zone.run`, `zoneDelegate.invokeTask`.
 *
 * This import should be commented out in production mode because it will have a negative impact
 * on performance if an error is thrown.
 */
// import 'zone.js/plugins/zone-error';  // Included with Angular CLI.
