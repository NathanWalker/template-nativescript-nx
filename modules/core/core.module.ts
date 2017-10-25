import { NgModule } from '@angular/core';

// libs
import { TNSFontIconModule } from 'nativescript-ngx-fonticon';

// app
import { CORE_PROVIDERS } from './services';
import { ITEMS_PROVIDERS } from '../items/services';

@NgModule({
  imports: [
    TNSFontIconModule.forRoot({
      fa: './assets/font-awesome.min.css'
    })
  ],
  providers: [
    ...CORE_PROVIDERS,
    ...ITEMS_PROVIDERS
  ]
})
export class CoreModule {}
