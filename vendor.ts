import './vendor-platform';

import 'reflect-metadata';

// ng
import '@angular/platform-browser';
import '@angular/core';
import '@angular/common';
import '@angular/forms';
import '@angular/http';
import '@angular/router';

// ng libs
import '@ngrx/effects';
import '@ngrx/store';
import '@ngrx/router-store';

// ns-ng
import 'nativescript-angular/platform-static';
import 'nativescript-angular/common';
import 'nativescript-angular/forms';
import 'nativescript-angular/http';
import 'nativescript-angular/router';

// shared libs across all apps in Nx workspace
// TODO: import any shared libs here

// ns plugins
import 'nativescript-ngx-fonticon';

/**
 * app shared code
 * this list will be barrels of code imported in many different modules
 * local to the {N} app here only
 */
import './modules/shared';
