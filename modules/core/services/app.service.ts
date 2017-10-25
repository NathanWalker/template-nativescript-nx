// angular
import { Injectable, NgZone } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';

// nativescript
import * as tnsApp from 'tns-core-modules/application';
import * as tnsUtils from 'tns-core-modules/utils/utils';
import { device, isIOS, isAndroid } from 'tns-core-modules/platform';
import { DeviceOrientation } from 'tns-core-modules/ui/enums';
import { RouterExtensions } from 'nativescript-angular/router';
import { TNSFontIconService } from 'nativescript-ngx-fonticon';

// libs
import { Subject } from 'rxjs/Subject';

/**
 * This service can be used for low level app wiring
 * for best practice purposes, this service sets up:
 * - app version
 * - orientation handling including a Subject the app can observe
 * - deviceType to help component bindings
 * - example of global app event wiring for resume/suspend
 * - injection of TNSFontIconService to ensure font icons are loaded on boot
 */
@Injectable()
export class AppService {
  // fundamentals
  private _appVersion: string;

  // orientation helper
  private _orientation: string;
  private _orientation$: Subject<any> = new Subject();
  private _deviceType: 'Phone' | 'Tablet';

  constructor(
    private _router: RouterExtensions,
    private _ngRouter: Router,
    private _ngZone: NgZone,
    // ensures font icon's are initialized on app boot
    private _fonticon: TNSFontIconService
  ) {
    // initialize core services
    this._initAppVersion();
    this._initOrientation();
    this._initAppEvents();
  }

  public get orientation() {
    return this._orientation;
  }

  public set orientation(value) {
    console.log('setting orientation:', value);
    this._orientation = value;
    this._orientation$.next(value);
  }

  public get orientation$() {
    return this._orientation$;
  }

  public get deviceType() {
    return this._deviceType;
  }

  public get appVersion() {
    return this._appVersion;
  }

  private _initAppVersion() {
    let versionName: string;
    let buildNumber: string;

    if (tnsApp.android) {
      const pi = tnsApp.android.context.getPackageManager().getPackageInfo(tnsApp.android.context.getPackageName(), 0);
      versionName = pi.versionName;
      buildNumber = pi.versionCode.toString();
    } else if (tnsApp.ios) {
      versionName = NSBundle.mainBundle.objectForInfoDictionaryKey('CFBundleShortVersionString');
      buildNumber = NSBundle.mainBundle.objectForInfoDictionaryKey('CFBundleVersion');
    }
    this._appVersion = `v${versionName} (${buildNumber})`;
    console.log('App version:', this._appVersion);
  }

  private _initAppEvents() {
    // For the future - may want to use these
    tnsApp.on(tnsApp.resumeEvent, () => {
      console.log('tnsApp.resumeEvent');
    });
    tnsApp.on(tnsApp.suspendEvent, () => {
      console.log('tnsApp.suspendEvent');
    });
  }

  private _initOrientation() {
    this._deviceType = device.deviceType;
    console.log('deviceType:', this._deviceType);
    console.log('initializing orientation handling.');

    // set initial orientation
    this.orientation = getOrientation();
    console.log('current orientation:', this.orientation);

    // handle orientation changes
    tnsApp.on(tnsApp.orientationChangedEvent, e => {
      // sometimes e.newValue will be undefined, ignore those
      if (e.newValue && this.orientation !== e.newValue) {
        console.log(`Old: ${this.orientation}; New: ${e.newValue}`);
        this._ngZone.run(() => {
          this.orientation = getOrientation();
        });
      }
    });
  }
}

const getOrientation = function() {
  if (isIOS) {
    const deviceOrientation = tnsUtils.ios.getter(UIDevice, UIDevice.currentDevice).orientation;

    return deviceOrientation === UIDeviceOrientation.LandscapeLeft ||
      deviceOrientation === UIDeviceOrientation.LandscapeRight
      ? DeviceOrientation.landscape
      : DeviceOrientation.portrait;
  } else {
    const orientation = getContext()
      .getResources()
      .getConfiguration().orientation;
    switch (orientation) {
      case 1 /* ORIENTATION_PORTRAIT (0x00000001) */:
        return DeviceOrientation.portrait;
      case 2 /* ORIENTATION_LANDSCAPE (0x00000002) */:
        return DeviceOrientation.landscape;
      default:
        /* ORIENTATION_UNDEFINED (0x00000000) */
        return DeviceOrientation.portrait;
    }
  }
};

const getContext = function() {
  const ctx = java.lang.Class
    .forName('android.app.AppGlobals')
    .getMethod('getInitialApplication', null)
    .invoke(null, null);
  if (ctx) {
    return ctx;
  }

  return java.lang.Class
    .forName('android.app.ActivityThread')
    .getMethod('currentApplication', null)
    .invoke(null, null);
};
