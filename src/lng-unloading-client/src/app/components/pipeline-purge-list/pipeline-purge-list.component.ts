import { Component, OnInit, ViewChild } from '@angular/core';
import { DxDataGridComponent, DxFormComponent } from 'devextreme-angular';
import { PipelinePurgeService } from '../../services/pipeline-purge.service';
import { BerthPlanService } from '../../services/berth-plan.service';
import { PipelinePurge, PipelinePurgeStatus, CreatePipelinePurge, ConfirmPurge } from '../../models/pipeline-purge.model';
import { BerthPlan } from '../../models/berth-plan.model';

@Component({
  selector: 'app-pipeline-purge-list',
  template: `
    <div class="page-container">
      <h2 class="page-title">管线置换管理</h2>
      <div class="toolbar">
        <dx-button text="新增置换记录" type="default" icon="plus" (onClick)="showAddPopup()"></dx-button>
      </div>
      <dx-data-grid
        [dataSource]="dataSource"
        [showBorders]="true"
        [rowAlternationEnabled]="true"
        [allowColumnResizing]="true"
        [columnAutoWidth]="true">
        <dxi-column dataField="purgeNo" caption="置换编号" width="140"></dxi-column>
        <dxi-column dataField="pipelineName" caption="管线名称" width="140"></dxi-column>
        <dxi-column caption="靠泊计划" width="160" cellTemplate="planTemplate"></dxi-column>
        <div *dxTemplate="let cell of 'planTemplate'">
          {{ getPlanName(cell.data.berthPlanId) }}
        </div>
        <dxi-column dataField="purgeStartTime" caption="置换开始" dataType="date" format="yyyy-MM-dd HH:mm" width="150"></dxi-column>
        <dxi-column dataField="purgeEndTime" caption="置换结束" dataType="date" format="yyyy-MM-dd HH:mm" width="150"></dxi-column>
        <dxi-column dataField="oxygenContent" caption="氧含量(%)" width="120" cellTemplate="oxygenTemplate"></dxi-column>
        <div *dxTemplate="let cell of 'oxygenTemplate'">
          <span [style.color]="isOxygenQualified(cell.data) ? '#2e7d32' : '#c62828'">
            {{ cell.data.oxygenContent ?? '-' }} / 限值{{ cell.data.oxygenLimit }}
          </span>
        </div>
        <dxi-column dataField="purgeMedium" caption="置换介质" width="100"></dxi-column>
        <dxi-column dataField="processEngineer" caption="工艺工程师" width="120"></dxi-column>
        <dxi-column caption="状态" width="100" cellTemplate="statusTemplate"></dxi-column>
        <div *dxTemplate="let cell of 'statusTemplate'">
          <span [class]="getStatusClass(cell.data.status)">{{ getStatusText(cell.data.status) }}</span>
        </div>
        <dxi-column type="buttons" caption="操作" width="330">
          <dxi-button text="编辑" icon="edit" (onClick)="editRow($event)"></dxi-button>
          <dxi-button text="录入氧含量" icon="doc" (onClick)="showOxygenPopup($event)" [visible]="canConfirmOxygen($event)"></dxi-button>
          <dxi-button text="工程师确认" icon="check" (onClick)="engineerConfirm($event)" [visible]="canEngineerConfirm($event)"></dxi-button>
          <dxi-button text="删除" icon="trash" (onClick)="deleteRow($event)"></dxi-button>
        </dxi-column>
      </dx-data-grid>

      <dx-popup
        [visible]="popupVisible"
        [dragEnabled]="false"
        [closeOnOutsideClick]="true"
        [width]="700"
        [height]="550"
        (onHidden)="onPopupHidden()">
        <div *dxTemplate="let data of 'content'">
          <h3 style="margin-top: 0">{{ isEditing ? '编辑置换记录' : '新增置换记录' }}</h3>
          <dx-form
            #form
            [formData]="formData"
            [labelLocation]="'top'">
            <dxi-item dataField="purgeNo" label="置换编号">
              <dxi-validation-rule type="required" message="置换编号不能为空"></dxi-validation-rule>
            </dxi-item>
            <dxi-item dataField="berthPlanId" label="关联靠泊计划" editorType="dxSelectBox"
              [editorOptions]="{ items: berthPlans, displayExpr: 'planNo', valueExpr: 'id', placeholder: '请选择靠泊计划' }">
              <dxi-validation-rule type="required" message="请选择靠泊计划"></dxi-validation-rule>
            </dxi-item>
            <dxi-item dataField="pipelineName" label="管线名称">
              <dxi-validation-rule type="required" message="管线名称不能为空"></dxi-validation-rule>
            </dxi-item>
            <dxi-item dataField="purgeStartTime" label="置换开始时间" editorType="dxDateBox"
              [editorOptions]="{ type: 'datetime', displayFormat: 'yyyy-MM-dd HH:mm' }"></dxi-item>
            <dxi-item dataField="purgeEndTime" label="置换结束时间" editorType="dxDateBox"
              [editorOptions]="{ type: 'datetime', displayFormat: 'yyyy-MM-dd HH:mm' }"></dxi-item>
            <dxi-item dataField="oxygenLimit" label="氧含量限值(%)" editorType="dxNumberBox"
              [editorOptions]="{ min: 0, step: 0.01, format: '#,##0.00' }"></dxi-item>
            <dxi-item dataField="purgeMedium" label="置换介质"></dxi-item>
            <dxi-item dataField="processEngineer" label="工艺工程师"></dxi-item>
            <dxi-item dataField="remark" label="备注" editorType="dxTextArea"
              [editorOptions]="{ height: 60 }"></dxi-item>
          </dx-form>
          <div style="margin-top: 20px; text-align: right;">
            <dx-button text="取消" (onClick)="popupVisible = false" style="margin-right: 8px;"></dx-button>
            <dx-button text="保存" type="default" (onClick)="saveForm()"></dx-button>
          </div>
        </div>
      </dx-popup>

      <dx-popup
        [visible]="oxygenPopupVisible"
        [dragEnabled]="false"
        [closeOnOutsideClick]="true"
        [width]="500"
        [height]="400">
        <div *dxTemplate="let data of 'content'">
          <h3 style="margin-top: 0">录入氧含量检测结果</h3>
          <dx-form
            #oxygenForm
            [formData]="oxygenFormData"
            [labelLocation]="'top'">
            <dxi-item dataField="oxygenContent" label="氧含量检测值(%)" editorType="dxNumberBox"
              [editorOptions]="{ min: 0, max: 100, step: 0.001, format: '#,##0.000' }">
              <dxi-validation-rule type="required" message="请输入氧含量"></dxi-validation-rule>
            </dxi-item>
            <dxi-item dataField="oxygenTestTime" label="检测时间" editorType="dxDateBox"
              [editorOptions]="{ type: 'datetime', displayFormat: 'yyyy-MM-dd HH:mm' }">
              <dxi-validation-rule type="required" message="请选择检测时间"></dxi-validation-rule>
            </dxi-item>
            <dxi-item dataField="processEngineer" label="检测人员">
              <dxi-validation-rule type="required" message="请输入检测人员"></dxi-validation-rule>
            </dxi-item>
          </dx-form>
          <div style="margin-top: 20px; text-align: right;">
            <dx-button text="取消" (onClick)="oxygenPopupVisible = false" style="margin-right: 8px;"></dx-button>
            <dx-button text="确认" type="default" (onClick)="saveOxygen()"></dx-button>
          </div>
        </div>
      </dx-popup>
    </div>
  `
})
export class PipelinePurgeListComponent implements OnInit {
  @ViewChild(DxFormComponent) form!: DxFormComponent;
  @ViewChild(DxFormComponent) oxygenForm!: DxFormComponent;

  dataSource: PipelinePurge[] = [];
  berthPlans: BerthPlan[] = [];
  popupVisible = false;
  oxygenPopupVisible = false;
  isEditing = false;
  editingId: string | null = null;
  oxygenEditingId: string | null = null;
  formData: Partial<CreatePipelinePurge> = { oxygenLimit: 0.5 };
  oxygenFormData: Partial<ConfirmPurge> = { oxygenTestTime: new Date() };

  constructor(
    private service: PipelinePurgeService,
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

  isOxygenQualified(data: PipelinePurge): boolean {
    return data.oxygenContent != null && data.oxygenContent <= data.oxygenLimit;
  }

  canConfirmOxygen(e: any): boolean {
    const status = e.row.data.status;
    return status === PipelinePurgeStatus.Pending || status === PipelinePurgeStatus.InProgress;
  }

  canEngineerConfirm(e: any): boolean {
    return e.row.data.status === PipelinePurgeStatus.Qualified;
  }

  showAddPopup(): void {
    this.isEditing = false;
    this.editingId = null;
    this.formData = { oxygenLimit: 0.5 };
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
    if (confirm('确定删除该置换记录？')) {
      this.service.delete(e.row.data.id).subscribe(() => this.loadData());
    }
  }

  showOxygenPopup(e: any): void {
    this.oxygenEditingId = e.row.data.id;
    this.oxygenFormData = {
      oxygenContent: e.row.data.oxygenContent,
      oxygenTestTime: e.row.data.oxygenTestTime ? new Date(e.row.data.oxygenTestTime) : new Date(),
      processEngineer: e.row.data.processEngineer
    };
    this.oxygenPopupVisible = true;
  }

  engineerConfirm(e: any): void {
    if (!confirm('确认该管线置换合格？氧含量未达标将无法开始卸船。')) return;
    this.service.engineerConfirm(e.row.data.id).subscribe({
      next: () => {
        alert('确认成功');
        this.loadData();
      },
      error: (err) => alert(err.error?.message || '确认失败')
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
      this.service.create(this.formData as CreatePipelinePurge).subscribe(() => {
        this.popupVisible = false;
        this.loadData();
      });
    }
  }

  saveOxygen(): void {
    const result = this.oxygenForm.instance.validate();
    if (!result.isValid || !this.oxygenEditingId) return;

    this.service.confirmOxygenContent(this.oxygenEditingId, this.oxygenFormData as ConfirmPurge).subscribe({
      next: (data) => {
        this.oxygenPopupVisible = false;
        this.loadData();
        const qualified = this.isOxygenQualified(data);
        alert('氧含量检测已录入，结果：' + (qualified ? '合格' : '不合格'));
      },
      error: (err) => alert(err.error?.message || '录入失败')
    });
  }

  onPopupHidden(): void {
    this.formData = { oxygenLimit: 0.5 };
  }

  getStatusText(status: PipelinePurgeStatus): string {
    const map: Record<PipelinePurgeStatus, string> = {
      [PipelinePurgeStatus.Pending]: '待置换',
      [PipelinePurgeStatus.InProgress]: '置换中',
      [PipelinePurgeStatus.OxygenTesting]: '检测中',
      [PipelinePurgeStatus.Qualified]: '检测合格',
      [PipelinePurgeStatus.Failed]: '检测不合格',
      [PipelinePurgeStatus.Confirmed]: '已确认'
    };
    return map[status] || '未知';
  }

  getStatusClass(status: PipelinePurgeStatus): string {
    const map: Record<PipelinePurgeStatus, string> = {
      [PipelinePurgeStatus.Pending]: 'status-badge status-draft',
      [PipelinePurgeStatus.InProgress]: 'status-badge status-active',
      [PipelinePurgeStatus.OxygenTesting]: 'status-badge status-active',
      [PipelinePurgeStatus.Qualified]: 'status-badge status-success',
      [PipelinePurgeStatus.Failed]: 'status-badge status-error',
      [PipelinePurgeStatus.Confirmed]: 'status-badge status-success'
    };
    return map[status] || 'status-badge';
  }
}
