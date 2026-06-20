import { Component, OnInit, ViewChild } from '@angular/core';
import { DxFormComponent } from 'devextreme-angular';
import { MeteringRecordService } from '../../services/metering-record.service';
import { BerthPlanService } from '../../services/berth-plan.service';
import {
  MeteringRecord,
  MeteringStatus,
  CreateMeteringRecord,
  ReviewMetering
} from '../../models/metering-record.model';
import { BerthPlan } from '../../models/berth-plan.model';

@Component({
  selector: 'app-metering-record-list',
  template: `
    <div class="page-container">
      <h2 class="page-title">计量交接管理</h2>
      <div class="toolbar">
        <dx-button text="新增计量记录" type="default" icon="plus" (onClick)="showAddPopup()"></dx-button>
      </div>
      <dx-data-grid
        [dataSource]="dataSource"
        [showBorders]="true"
        [rowAlternationEnabled]="true"
        [allowColumnResizing]="true"
        [columnAutoWidth]="true">
        <dxi-column dataField="meteringNo" caption="计量编号" width="140"></dxi-column>
        <dxi-column caption="靠泊计划" width="160" cellTemplate="planTemplate"></dxi-column>
        <div *dxTemplate="let cell of 'planTemplate'">
          {{ getPlanName(cell.data.berthPlanId) }}
        </div>
        <dxi-column dataField="meteringStartTime" caption="开始时间" dataType="date" format="yyyy-MM-dd HH:mm" width="150"></dxi-column>
        <dxi-column dataField="meteringEndTime" caption="结束时间" dataType="date" format="yyyy-MM-dd HH:mm" width="150"></dxi-column>
        <dxi-column dataField="loadingQuantity" caption="装船量(吨)" width="120"></dxi-column>
        <dxi-column dataField="unloadingQuantity" caption="卸船量(吨)" width="120"></dxi-column>
        <dxi-column dataField="shipFigureQuantity" caption="船方量(吨)" width="120"></dxi-column>
        <dxi-column dataField="shoreFigureQuantity" caption="岸方量(吨)" width="120"></dxi-column>
        <dxi-column caption="差异" width="180" cellTemplate="diffTemplate"></dxi-column>
        <div *dxTemplate="let cell of 'diffTemplate'">
          <span [style.color]="cell.data.isDifferenceExceeded ? '#c62828' : '#2e7d32'">
            差异量: {{ cell.data.differenceAmount ?? '-' }} 吨<br>
            差异率: {{ cell.data.differenceRate ? cell.data.differenceRate.toFixed(3) + '%' : '-' }}
            <span *ngIf="cell.data.isDifferenceExceeded" style="color:#c62828;">(超限)</span>
          </span>
        </div>
        <dxi-column dataField="meteringOperator" caption="计量员" width="100"></dxi-column>
        <dxi-column dataField="reviewer" caption="复核人" width="100"></dxi-column>
        <dxi-column caption="状态" width="120" cellTemplate="statusTemplate"></dxi-column>
        <div *dxTemplate="let cell of 'statusTemplate'">
          <span [class]="getStatusClass(cell.data.status)">{{ getStatusText(cell.data.status) }}</span>
        </div>
        <dxi-column type="buttons" caption="操作" width="320">
          <dxi-button text="编辑" icon="edit" (onClick)="editRow($event)" [visible]="canEdit($event)"></dxi-button>
          <dxi-button text="提交" icon="send" (onClick)="submitRow($event)" [visible]="canSubmit($event)"></dxi-button>
          <dxi-button text="复核" icon="check" (onClick)="showReviewPopup($event)" [visible]="canReview($event)"></dxi-button>
          <dxi-button text="删除" icon="trash" (onClick)="deleteRow($event)" [visible]="canDelete($event)"></dxi-button>
        </dxi-column>
      </dx-data-grid>

      <dx-popup
        [visible]="popupVisible"
        [dragEnabled]="false"
        [closeOnOutsideClick]="true"
        [width]="750"
        [height]="650"
        (onHidden)="onPopupHidden()">
        <div *dxTemplate="let data of 'content'">
          <h3 style="margin-top: 0">{{ isEditing ? '编辑计量记录' : '新增计量记录' }}</h3>
          <dx-form
            #form
            [formData]="formData"
            [labelLocation]="'top'">
            <dxi-item dataField="meteringNo" label="计量编号">
              <dxi-validation-rule type="required" message="计量编号不能为空"></dxi-validation-rule>
            </dxi-item>
            <dxi-item dataField="berthPlanId" label="关联靠泊计划" editorType="dxSelectBox"
              [editorOptions]="{ items: berthPlans, displayExpr: 'planNo', valueExpr: 'id' }">
              <dxi-validation-rule type="required" message="请选择靠泊计划"></dxi-validation-rule>
            </dxi-item>
            <dxi-item dataField="meteringStartTime" label="计量开始时间" editorType="dxDateBox"
              [editorOptions]="{ type: 'datetime', displayFormat: 'yyyy-MM-dd HH:mm' }"></dxi-item>
            <dxi-item dataField="meteringEndTime" label="计量结束时间" editorType="dxDateBox"
              [editorOptions]="{ type: 'datetime', displayFormat: 'yyyy-MM-dd HH:mm' }"></dxi-item>
            <dxi-item dataField="loadingQuantity" label="装船量(吨)" editorType="dxNumberBox"
              [editorOptions]="{ min: 0, step: 0.001, format: '#,##0.000' }"></dxi-item>
            <dxi-item dataField="unloadingQuantity" label="卸船量(吨)" editorType="dxNumberBox"
              [editorOptions]="{ min: 0, step: 0.001, format: '#,##0.000' }"></dxi-item>
            <dxi-item dataField="shipFigureQuantity" label="船方量(吨)" editorType="dxNumberBox"
              [editorOptions]="{ min: 0, step: 0.001, format: '#,##0.000' }"></dxi-item>
            <dxi-item dataField="shoreFigureQuantity" label="岸方量(吨)" editorType="dxNumberBox"
              [editorOptions]="{ min: 0, step: 0.001, format: '#,##0.000' }"></dxi-item>
            <dxi-item dataField="differenceLimitRate" label="差异限值率(%)" editorType="dxNumberBox"
              [editorOptions]="{ min: 0, step: 0.01, format: '#,##0.00' }"></dxi-item>
            <dxi-item dataField="meteringOperator" label="计量员"></dxi-item>
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
        [visible]="reviewPopupVisible"
        [dragEnabled]="false"
        [closeOnOutsideClick]="true"
        [width]="500"
        [height]="400">
        <div *dxTemplate="let data of 'content'">
          <h3 style="margin-top: 0">计量复核 - {{ reviewRow?.meteringNo }}</h3>
          <div style="margin-bottom: 16px;">
            <p><strong>计量差异:</strong> {{ reviewRow?.differenceAmount }} 吨 / {{ reviewRow?.differenceRate?.toFixed(3) }}%</p>
            <p><strong>差异限值:</strong> {{ reviewRow?.differenceLimitRate }}%</p>
          </div>
          <dx-form
            #reviewForm
            [formData]="reviewFormData"
            [labelLocation]="'top'">
            <dxi-item dataField="reviewer" label="复核人">
              <dxi-validation-rule type="required" message="复核人不能为空"></dxi-validation-rule>
            </dxi-item>
            <dxi-item dataField="reviewComment" label="复核意见" editorType="dxTextArea"
              [editorOptions]="{ height: 80 }"></dxi-item>
            <dxi-item dataField="isApproved" label="复核结论" editorType="dxRadioGroup"
              [editorOptions]="{ items: reviewOptions, displayExpr: 'text', valueExpr: 'value', layout: 'horizontal' }">
            </dxi-item>
          </dx-form>
          <div style="margin-top: 20px; text-align: right;">
            <dx-button text="取消" (onClick)="reviewPopupVisible = false" style="margin-right: 8px;"></dx-button>
            <dx-button text="提交复核" type="default" (onClick)="submitReview()"></dx-button>
          </div>
        </div>
      </dx-popup>
    </div>
  `
})
export class MeteringRecordListComponent implements OnInit {
  @ViewChild(DxFormComponent) form!: DxFormComponent;
  @ViewChild(DxFormComponent) reviewForm!: DxFormComponent;

  dataSource: MeteringRecord[] = [];
  berthPlans: BerthPlan[] = [];
  popupVisible = false;
  reviewPopupVisible = false;
  isEditing = false;
  editingId: string | null = null;
  reviewRow: MeteringRecord | null = null;
  formData: Partial<CreateMeteringRecord> = { differenceLimitRate: 0.3 };
  reviewFormData: ReviewMetering = { reviewer: '', reviewComment: '', isApproved: true };
  reviewOptions = [
    { text: '通过', value: true },
    { text: '驳回', value: false }
  ];

  constructor(
    private service: MeteringRecordService,
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

  canEdit(e: any): boolean {
    return e.row.data.status === MeteringStatus.Draft || e.row.data.status === MeteringStatus.Rejected;
  }

  canSubmit(e: any): boolean {
    return e.row.data.status === MeteringStatus.Draft;
  }

  canReview(e: any): boolean {
    return e.row.data.status === MeteringStatus.ReviewRequired;
  }

  canDelete(e: any): boolean {
    return e.row.data.status === MeteringStatus.Draft;
  }

  showAddPopup(): void {
    this.isEditing = false;
    this.editingId = null;
    this.formData = { differenceLimitRate: 0.3 };
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
    if (confirm('确定删除该计量记录？')) {
      this.service.delete(e.row.data.id).subscribe(() => this.loadData());
    }
  }

  submitRow(e: any): void {
    if (!confirm('确定提交计量记录？系统将自动计算差异，差异超限将自动触发复核流程。')) return;
    this.service.submit(e.row.data.id).subscribe({
      next: () => {
        alert('提交成功');
        this.loadData();
      },
      error: (err) => alert(err.error?.message || '提交失败')
    });
  }

  showReviewPopup(e: any): void {
    this.reviewRow = e.row.data;
    this.reviewFormData = { reviewer: '', reviewComment: '', isApproved: true };
    this.reviewPopupVisible = true;
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
      this.service.create(this.formData as CreateMeteringRecord).subscribe(() => {
        this.popupVisible = false;
        this.loadData();
      });
    }
  }

  submitReview(): void {
    const result = this.reviewForm.instance.validate();
    if (!result.isValid || !this.reviewRow) return;

    this.service.review(this.reviewRow.id, this.reviewFormData).subscribe({
      next: () => {
        alert('复核完成');
        this.reviewPopupVisible = false;
        this.loadData();
      },
      error: (err) => alert(err.error?.message || '复核失败')
    });
  }

  onPopupHidden(): void {
    this.formData = { differenceLimitRate: 0.3 };
  }

  getStatusText(status: MeteringStatus): string {
    const map: Record<MeteringStatus, string> = {
      [MeteringStatus.Draft]: '草稿',
      [MeteringStatus.Submitted]: '已提交',
      [MeteringStatus.ReviewRequired]: '待复核',
      [MeteringStatus.Reviewed]: '已复核',
      [MeteringStatus.Confirmed]: '已确认',
      [MeteringStatus.Rejected]: '已驳回'
    };
    return map[status] || '未知';
  }

  getStatusClass(status: MeteringStatus): string {
    const map: Record<MeteringStatus, string> = {
      [MeteringStatus.Draft]: 'status-badge status-draft',
      [MeteringStatus.Submitted]: 'status-badge status-active',
      [MeteringStatus.ReviewRequired]: 'status-badge status-warning',
      [MeteringStatus.Reviewed]: 'status-badge status-success',
      [MeteringStatus.Confirmed]: 'status-badge status-success',
      [MeteringStatus.Rejected]: 'status-badge status-error'
    };
    return map[status] || 'status-badge';
  }
}
