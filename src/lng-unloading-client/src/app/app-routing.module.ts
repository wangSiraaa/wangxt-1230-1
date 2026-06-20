import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { BerthPlanListComponent } from './components/berth-plan-list/berth-plan-list.component';
import { PipelinePurgeListComponent } from './components/pipeline-purge-list/pipeline-purge-list.component';
import { MeteringRecordListComponent } from './components/metering-record-list/metering-record-list.component';
import { ShutdownEventListComponent } from './components/shutdown-event-list/shutdown-event-list.component';

const routes: Routes = [
  { path: '', redirectTo: '/berth-plans', pathMatch: 'full' },
  { path: 'berth-plans', component: BerthPlanListComponent },
  { path: 'pipeline-purges', component: PipelinePurgeListComponent },
  { path: 'metering-records', component: MeteringRecordListComponent },
  { path: 'shutdown-events', component: ShutdownEventListComponent }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
