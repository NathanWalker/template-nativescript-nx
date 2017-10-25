import { NgModule, NO_ERRORS_SCHEMA } from '@angular/core';
import { Routes } from '@angular/router';

// nativescript
import { NativeScriptRouterModule } from 'nativescript-angular/router';

// app
import { SharedModule } from '../shared/shared.module';
import { COMPONENTS, ItemsComponent, ItemDetailComponent } from './components';

export const routes: Routes = [
  {
    path: '',
    component: ItemsComponent
  },
  {
    path: ':id',
    component: ItemDetailComponent
  }
];

@NgModule({
  imports: [
    SharedModule,
    NativeScriptRouterModule.forChild(routes)
  ],
  declarations: [
    ...COMPONENTS
  ],
  schemas: [
    NO_ERRORS_SCHEMA
  ]
})
export class ItemsModule {}
