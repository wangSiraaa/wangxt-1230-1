import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { HttpClientModule } from '@angular/common/http';
import { ReactiveFormsModule } from '@angular/forms';

import { DxDataGridModule, DxButtonModule, DxPopupModule, DxFormModule, DxSelectBoxModule, DxDateBoxModule, DxNumberBoxModule, DxTextAreaModule, DxRadioGroupModule } from 'devextreme-angular';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { BerthPlanListComponent } from './components/berth-plan-list/berth-plan-list.component';
import { PipelinePurgeListComponent } from './components/pipeline-purge-list/pipeline-purge-list.component';
import { MeteringRecordListComponent } from './components/metering-record-list/metering-record-list.component';
import { ShutdownEventListComponent } from './components/shutdown-event-list/shutdown-event-list.component';

@NgModule({
  declarations: [
    AppComponent,
    BerthPlanListComponent,
    PipelinePurgeListComponent,
    MeteringRecordListComponent,
    ShutdownEventListComponent
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    HttpClientModule,
    ReactiveFormsModule,
    AppRoutingModule,
    DxDataGridModule,
    DxButtonModule,
    DxPopupModule,
    DxFormModule,
    DxSelectBoxModule,
    DxDateBoxModule,
    DxNumberBoxModule,
    DxTextAreaModule,
    DxRadioGroupModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
