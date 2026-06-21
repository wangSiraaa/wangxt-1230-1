import { Component, OnInit, ViewChild } from '@angular/core';
import { DxFormComponent } from 'devextreme-angular';
import { ShutdownEventService } from '../../services/shutdown-event.service';
import { BerthPlanService } from '../../services/berth-plan.service';
import {
  ShutdownEvent,
  ShutdownStatus,
  ShutdownType,
  CreateShutdownEvent,
  RecordRecoveryCondition
} from '../../models/shutdown-event.model';
import { BerthPlan } from '../../models/berth-plan.model';

@Component({
  selector: 'app-shutdown-event-list',
  template: `
    <div class="page-container">
      <h2 class="page-title">异常停输管理</h2>
      <div class="toolbar">
        <dx-button text="新增停输事件" type="default" icon="plus" (onClick)="showAddPopup()"></dx-button>
      </div>
      <dx-data-grid
        [dataSource]="dataSource"
        [showBorders]="true"
        [rowAlternationEnabled]="true"
        [allowColumnResizing]="true"
        [columnAutoWidth]="true">
        <dxi-column dataField="shutdownNo" caption="停输编号" width="140"></dxi-column>
        <dxi-column caption="靠泊计划" width="160" cellTemplate="planTemplate"></dxi-column>
        <div *dxTemplate="let cell of 'planTemplate'">
          {{ getPlanName(cell.data.berthPlanId) }}
        </div>
        <dxi-column caption="停输类型" width="110" cellTemplate="typeTemplate"></dxi-column>
        <div *dxTemplate="let cell of 'typeTemplate'">
          {{ getTypeText(cell.data.shutdownType) }}
        </div>
        <dxi-column dataField="shutdownTime" caption="停输时间" dataType="date" format="yyyy-MM-dd HH:mm" width="150"></dxi-column>
        <dxi-column dataField="resumeTime" caption="恢复时间" dataType="date" format="yyyy-MM-dd HH:mm" width="150"></dxi-column>
        <dxi-column dataField="location" caption="位置" width="120"></dxi-column>
        <dxi-column dataField="description" caption="停输描述" width="200"></dxi-column>
        <dxi-column caption="恢复条件记录" width="130" cellTemplate="recoveryTemplate"></dxi-column>
        <div *dxTemplate="let cell of 'recoveryTemplate'">
          <span [style.color]="cell.data.recoveryConditionRecorded ? '#2e7d32' : '#c62828'">
            {{ cell.data.recoveryConditionRecorded ? '已记录' : '未记录' }}
          </span>
        </div>
        <dxi-column dataField="operator" caption="操作员" width="100"></dxi-column>
        <dxi-column caption="状态" width="100" cellTemplate="statusTemplate"></dxi-column>
        <div *dxTemplate="let cell of 'statusTemplate'">
          <span [class]="getStatusClass(cell.data.status)">{{ getStatusText(cell.data.status) }}</span>
        </div>
        <dxi-column type="buttons" caption="操作" width="380">
          <dxi-button text="编辑" icon="edit" (onClick)="editRow($event)" [visible]="canEdit($event)"></dxi-button>
          <dxi-button text="记录恢复条件" icon="doc" (onClick)="showRecoveryPopup($event)" [visible]="canRecordRecovery($event)"></dxi-button>
          <dxi-button text="恢复作业" icon="refresh" (onClick)="resumeRow($event)" [visible]="canResume($event)"></dxi-button>
          <dxi-button text="关闭" icon="close" (onClick)="closeRow($event)" [visible]="canClose($event)"></dxi-button>
          <dxi-button text="删除" icon="trash" (onClick)="deleteRow($event)" [visible]="canDelete($event)"></dxi-button>
        </dxi-column>
      </dx-data-grid>

      <dx-popup
        [visible]="popupVisible"
        [dragEnabled]="false"
        [closeOnOutsideClick]="true"
        [width]="750"
        [height]="600"
        (onHidden)="onPopupHidden()">
        <div *dxTemplate="let data of 'content'">
          <h3 style="margin-top: 0">{{ isEditing ? '编辑停输事件' : '新增停输事件' }}</h3>
          <dx-form
            #form
            [formData]="formData"
            [labelLocation]="'top'">
            <dxi-item dataField="shutdownNo" label="停输编号">
              <dxi-validation-rule type="required" message="停输编号不能为空"></dxi-validation-rule>
            </dxi-item>
            <dxi-item dataField="berthPlanId" label="关联靠泊计划" editorType="dxSelectBox"
              [editorOptions]="{ items: berthPlans, displayExpr: 'planNo', valueExpr: 'id' }">
              <dxi-validation-rule type="required" message="请选择靠泊计划"></dxi-validation-rule>
            </dxi-item>
            <dxi-item dataField="shutdownType" label="停输类型" editorType="dxSelectBox"
              [editorOptions]="{ items: shutdownTypeOptions, displayExpr: 'text', valueExpr: 'value' }">
              <dxi-validation-rule type="required" message="请选择停输类型"></dxi-validation-rule>
            </dxi-item>
            <dxi-item dataField="shutdownTime" label="停输时间" editorType="dxDateBox"
              [editorOptions]="{ type: 'datetime', displayFormat: 'yyyy-MM-dd HH:mm' }">
              <dxi-validation-rule type="required" message="请选择停输时间"></dxi-validation-rule>
            </dxi-item>
            <dxi-item dataField="location" label="发生位置"></dxi-item>
            <dxi-item dataField="description" label="停输描述" editorType="dxTextArea"
              [editorOptions]="{ height: 80 }">
              <dxi-validation-rule type="required" message="请描述停输情况"></dxi-validation-rule>
            </dxi-item>
            <dxi-item dataField="cause" label="原因分析" editorType="dxTextArea"
              [editorOptions]="{ height: 60 }"></dxi-item>
            <dxi-item dataField="recoveryCondition" label="恢复前置条件" editorType="dxTextArea"
              [editorOptions]="{ height: 80 }"></dxi-item>
            <dxi-item dataField="recoveryMeasures" label="处置措施" editorType="dxTextArea"
              [editorOptions]="{ height: 60 }"></dxi-item>
            <dxi-item dataField="operator" label="操作员"></dxi-item>
            <dxi-item dataField="remark" label="备注" editorType="dxTextArea"
              [editorOptions]="{ height: 50 }"></dxi-item>
          </dx-form>
          <div style="margin-top: 20px; text-align: right;">
            <dx-button text="取消" (onClick)="popupVisible = false" style="margin-right: 8px;"></dx-button>
            <dx-button text="保存" type="default" (onClick)="saveForm()"></dx-button>
          </div>
        </div>
      </dx-popup>

      <dx-popup
        [visible]="recoveryPopupVisible"
        [dragEnabled]="false"
        [closeOnOutsideClick]="true"
        [width]="600"
        [height]="500">
        <div *dxTemplate="let data of 'content'">
          <h3 style="margin-top: 0">记录恢复条件 - {{ recoveryRow?.shutdownNo }}</h3>
          <dx-form
            #recoveryForm
            [formData]="recoveryFormData"
            [labelLocation]="'top'">
            <dxi-item dataField="recoveryCondition" label="恢复条件说明" editorType="dxTextArea"
              [editorOptions]="{ height: 100 }">
              <dxi-validation-rule type="required" message="请详细说明恢复条件"></dxi-validation-rule>
            </dxi-item>
            <dxi-item dataField="recoveryMeasures" label="恢复措施" editorType="dxTextArea"
              [editorOptions]="{ height: 80 }"></dxi-item>
            <dxi-item dataField="resumeTime" label="计划恢复时间" editorType="dxDateBox"
              [editorOptions]="{ type: 'datetime', displayFormat: 'yyyy-MM-dd HH:mm' }"></dxi-item>
          </dx-form>
          <div style="margin-top: 20px; text-align: right;">
            <dx-button text="取消" (onClick)="recoveryPopupVisible = false" style="margin-right: 8px;"></dx-button>
            <dx-button text="确认记录" type="default" (onClick)="submitRecovery()"></dx-button>
          </div>
        </div>
      </dx-popup>
    </div>
  `
})
export class ShutdownEventListComponent implements OnInit {
  @ViewChild(DxFormComponent) form!: DxFormComponent;
  @ViewChild(DxFormComponent) recoveryForm!: DxFormComponent;

  dataSource: ShutdownEvent[] = [];
  berthPlans: BerthPlan[] = [];
  popupVisible = false;
  recoveryPopupVisible = false;
  isEditing = false;
  editingId: string | null = null;
  recoveryRow: ShutdownEvent | null = null;
  formData: Partial<CreateShutdownEvent> = {
    shutdownType: ShutdownType.EquipmentFailure,
    shutdownTime: new Date()
  };
  recoveryFormData: Partial<RecordRecoveryCondition> = {};

  shutdownTypeOptions = [
    { text: '设备故障', value: ShutdownType.EquipmentFailure },
    { text: '安全事件', value: ShutdownType.SafetyIncident },
    { text: '天气原因', value: ShutdownType.Weather },
    { text: '操作原因', value: ShutdownType.Operational },
    { text: '其他', value: ShutdownType.Other }
  ];

  constructor(
    private service: ShutdownEventService,
    private berthPlanService: BerthPlanService
  ) { }

  ngOnInit(): void {
    this.loadData();
    this.loadBerthPlans();
  }

  loadData(): void {
    this.service.getAll().subscribe(data => {
      this.dataSource = data;
    });
  }

  loadBerthPlans(): void {
    this.berthPlanService.getAll().subscribe(data => {
      this.berthPlans = data;
    });
  }

  getPlanName(id: string): string {
    const plan = this.berthPlans.find(p => p.id === id);
    return plan ? plan.planNo + ' - ' + plan.vesselName : id;
  }

  getTypeText(type: ShutdownType): string {
    const map: Record<ShutdownType, string> = {
      [ShutdownType.EquipmentFailure]: '设备故障',
      [ShutdownType.SafetyIncident]: '安全事件',
      [ShutdownType.Weather]: '天气原因',
      [ShutdownType.Operational]: '操作原因',
      [ShutdownType.Other]: '其他'
    };
    return map[type] || '未知';
  }

  canEdit(e: any): boolean {
    return e.row.data.status !== ShutdownStatus.Closed;
  }

  canRecordRecovery(e: any): boolean {
    return e.row.data.status === ShutdownStatus.Occurred ||
           e.row.data.status === ShutdownStatus.Processing;
  }

  canResume(e: any): boolean {
    return (e.row.data.status === ShutdownStatus.Processing ||
            e.row.data.status === ShutdownStatus.Recovering) &&
           e.row.data.recoveryConditionRecorded;
  }

  canClose(e: any): boolean {
    return e.row.data.status === ShutdownStatus.Resumed;
  }

  canDelete(e: any): boolean {
    return e.row.data.status === ShutdownStatus.Occurred;
  }

  showAddPopup(): void {
    this.isEditing = false;
    this.editingId = null;
    this.formData = {
      shutdownType: ShutdownType.EquipmentFailure,
      shutdownTime: new Date()
    };
    this.popupVisible = true;
  }

  editRow(e: any): void {
    const row = e.row.data;
    this.isEditing = true;
    this.editingId = row.id;
    this.formData = { ...row };
    this.popupVisible = true;
  }

  deleteRow(e: any): void {
    if (confirm('确定删除该停输事件？')) {
      this.service.delete(e.row.data.id).subscribe(() => this.loadData());
    }
  }

  showRecoveryPopup(e: any): void {
    this.recoveryRow = e.row.data;
    this.recoveryFormData = {
      recoveryCondition: e.row.data.recoveryCondition,
      recoveryMeasures: e.row.data.recoveryMeasures,
      resumeTime: e.row.data.resumeTime ? new Date(e.row.data.resumeTime) : undefined
    };
    this.recoveryPopupVisible = true;
  }

  resumeRow(e: any): void {
    if (!confirm('确定恢复作业？系统将检查恢复条件是否已记录。')) return;
    this.service.resume(e.row.data.id).subscribe({
      next: () => {
        alert('恢复成功');
        this.loadData();
      },
      error: (err) => alert(err.error?.message || '恢复失败')
    });
  }

  closeRow(e: any): void {
    if (!confirm('确定关闭该停输事件？关闭后不可再编辑。')) return;
    this.service.close(e.row.data.id).subscribe({
      next: () => {
        alert('已关闭');
        this.loadData();
      },
      error: (err) => alert(err.error?.message || '操作失败')
    });
  }

  saveForm(): void {
    const result = this.form.instance.validate();
    if (!result.isValid) return;

    if (this.isEditing && this.editingId) {
      this.service.update(this.editingId, this.formData as any).subscribe(() => {
        this.popupVisible = false;
        this.loadData();
      });
    } else {
      this.service.create(this.formData as CreateShutdownEvent).subscribe(() => {
        this.popupVisible = false;
        this.loadData();
      });
    }
  }

  submitRecovery(): void {
    const result = this.recoveryForm.instance.validate();
    if (!result.isValid || !this.recoveryRow) return;

    this.service.recordRecoveryCondition(this.recoveryRow.id, this.recoveryFormData as RecordRecoveryCondition).subscribe({
      next: () => {
        alert('恢复条件已记录');
        this.recoveryPopupVisible = false;
        this.loadData();
      },
      error: (err) => alert(err.error?.message || '记录失败')
    });
  }

  onPopupHidden(): void {
    this.formData = {
      shutdownType: ShutdownType.EquipmentFailure,
      shutdownTime: new Date()
    };
  }

  getStatusText(status: ShutdownStatus): string {
    const map: Record<ShutdownStatus, string> = {
      [ShutdownStatus.Occurred]: '已发生',
      [ShutdownStatus.Processing]: '处置中',
      [ShutdownStatus.Recovering]: '恢复中',
      [ShutdownStatus.Resumed]: '已恢复',
      [ShutdownStatus.Closed]: '已关闭'
    };
    return map[status] || '未知';
  }

  getStatusClass(status: ShutdownStatus): string {
    const map: Record<ShutdownStatus, string> = {
      [ShutdownStatus.Occurred]: 'status-badge status-error',
      [ShutdownStatus.Processing]: 'status-badge status-warning',
      [ShutdownStatus.Recovering]: 'status-badge status-active',
      [ShutdownStatus.Resumed]: 'status-badge status-success',
      [ShutdownStatus.Closed]: 'status-badge status-draft'
    };
    return map[status] || 'status-badge';
  }
}
