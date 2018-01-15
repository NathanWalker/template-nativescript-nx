// Snapshot the ~/app.css and the theme
import * as application from 'tns-core-modules/application';
import 'ui/styling/style-scope';
const appCssContext = require.context("~/", false, /^\.\/app\.(css|scss|less|sass)$/);
global.registerWebpackModules(appCssContext);
application.loadAppCss();

import './vendor-platform';

import 'reflect-metadata';

// ng
import '@angular/platform-browser';
import '@angular/core';
import '@angular/common';
import '@angular/forms';
import '@angular/router';

// ng libs
import '@ngrx/effects';
import '@ngrx/store';
import '@ngrx/router-store';

// ns-ng
import 'nativescript-angular/platform-static';
import 'nativescript-angular/common';
import 'nativescript-angular/forms';
import 'nativescript-angular/http-client';
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
