import { Component, OnInit, ViewChild } from '@angular/core';
import { DxDataGridComponent, DxFormComponent } from 'devextreme-angular';
import { BerthPlanService } from '../../services/berth-plan.service';
import { BerthPlan, BerthPlanStatus, CreateBerthPlan } from '../../models/berth-plan.model';

@Component({
  selector: 'app-berth-plan-list',
  template: `
    <div class="page-container">
      <h2 class="page-title">靠泊计划管理</h2>
      <div class="toolbar">
        <dx-button text="新增计划" type="default" icon="plus" (onClick)="showAddPopup()"></dx-button>
      </div>
      <dx-data-grid
        #dataGrid
        [dataSource]="dataSource"
        [showBorders]="true"
        [rowAlternationEnabled]="true"
        [allowColumnResizing]="true"
        [columnAutoWidth]="true">
        <dxi-column dataField="planNo" caption="计划编号" width="140"></dxi-column>
        <dxi-column dataField="vesselName" caption="船名" width="140"></dxi-column>
        <dxi-column dataField="vesselImoNo" caption="IMO编号" width="120"></dxi-column>
        <dxi-column dataField="berthNo" caption="泊位号" width="100"></dxi-column>
        <dxi-column dataField="eta" caption="预计到港" dataType="date" format="yyyy-MM-dd HH:mm" width="160"></dxi-column>
        <dxi-column dataField="etd" caption="预计离港" dataType="date" format="yyyy-MM-dd HH:mm" width="160"></dxi-column>
        <dxi-column dataField="plannedQuantity" caption="计划数量(吨)" width="130"></dxi-column>
        <dxi-column dataField="cargoType" caption="货物类型" width="100"></dxi-column>
        <dxi-column dataField="dispatcher" caption="调度员" width="100"></dxi-column>
        <dxi-column caption="状态" width="100" cellTemplate="statusTemplate"></dxi-column>
        <div *dxTemplate="let cell of 'statusTemplate'">
          <span [class]="getStatusClass(cell.data.status)">{{ getStatusText(cell.data.status) }}</span>
        </div>
        <dxi-column type="buttons" caption="操作" width="280">
          <dxi-button text="编辑" icon="edit" (onClick)="editRow($event)"></dxi-button>
          <dxi-button text="开始卸船" icon="play" (onClick)="startUnloading($event)" [visible]="canStartUnloading($event)"></dxi-button>
          <dxi-button text="完成卸船" icon="check" (onClick)="completeUnloading($event)" [visible]="canCompleteUnloading($event)"></dxi-button>
          <dxi-button text="删除" icon="trash" (onClick)="deleteRow($event)"></dxi-button>
        </dxi-column>
      </dx-data-grid>

      <dx-popup
        [visible]="popupVisible"
        [dragEnabled]="false"
        [closeOnOutsideClick]="true"
        [width]="700"
        [height]="600"
        (onHidden)="onPopupHidden()">
        <div *dxTemplate="let data of 'content'">
          <h3 style="margin-top: 0">{{ isEditing ? '编辑靠泊计划' : '新增靠泊计划' }}</h3>
          <dx-form
            #form
            [formData]="formData"
            [labelLocation]="'top'">
            <dxi-item dataField="planNo" label="计划编号" [editorOptions]="{ placeholder: '请输入计划编号' }">
              <dxi-validation-rule type="required" message="计划编号不能为空"></dxi-validation-rule>
            </dxi-item>
            <dxi-item dataField="vesselName" label="船名" [editorOptions]="{ placeholder: '请输入船名' }">
              <dxi-validation-rule type="required" message="船名不能为空"></dxi-validation-rule>
            </dxi-item>
            <dxi-item dataField="vesselImoNo" label="IMO编号"></dxi-item>
            <dxi-item dataField="berthNo" label="泊位号"></dxi-item>
            <dxi-item dataField="eta" label="预计到港时间" editorType="dxDateBox"
              [editorOptions]="{ type: 'datetime', displayFormat: 'yyyy-MM-dd HH:mm' }"></dxi-item>
            <dxi-item dataField="etd" label="预计离港时间" editorType="dxDateBox"
              [editorOptions]="{ type: 'datetime', displayFormat: 'yyyy-MM-dd HH:mm' }"></dxi-item>
            <dxi-item dataField="plannedQuantity" label="计划数量(吨)" editorType="dxNumberBox"
              [editorOptions]="{ min: 0, step: 1, format: '#,##0.000' }"></dxi-item>
            <dxi-item dataField="cargoType" label="货物类型"></dxi-item>
            <dxi-item dataField="shipper" label="发货人"></dxi-item>
            <dxi-item dataField="consignee" label="收货人"></dxi-item>
            <dxi-item dataField="dispatcher" label="调度员"></dxi-item>
            <dxi-item dataField="remark" label="备注" editorType="dxTextArea"
              [editorOptions]="{ height: 80 }"></dxi-item>
          </dx-form>
          <div style="margin-top: 20px; text-align: right;">
            <dx-button text="取消" (onClick)="popupVisible = false" style="margin-right: 8px;"></dx-button>
            <dx-button text="保存" type="default" (onClick)="saveForm()"></dx-button>
          </div>
        </div>
      </dx-popup>
    </div>
  `
})
export class BerthPlanListComponent implements OnInit {
  @ViewChild(DxDataGridComponent) dataGrid!: DxDataGridComponent;
  @ViewChild(DxFormComponent) form!: DxFormComponent;

  dataSource: BerthPlan[] = [];
  popupVisible = false;
  isEditing = false;
  editingId: string | null = null;
  formData: Partial<CreateBerthPlan> = {};

  constructor(private service: BerthPlanService) { }

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    this.service.getAll().subscribe(data => {
      this.dataSource = data;
    });
  }

  showAddPopup(): void {
    this.isEditing = false;
    this.editingId = null;
    this.formData = {};
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
    if (confirm('确定删除该靠泊计划？')) {
      this.service.delete(e.row.data.id).subscribe(() => this.loadData());
    }
  }

  canStartUnloading(e: any): boolean {
    const status = e.row.data.status;
    return status === BerthPlanStatus.Scheduled || status === BerthPlanStatus.Berthing;
  }

  canCompleteUnloading(e: any): boolean {
    return e.row.data.status === BerthPlanStatus.Unloading;
  }

  startUnloading(e: any): void {
    if (confirm('确定开始卸船？系统将检查管线置换是否合格。')) {
      this.service.startUnloading(e.row.data.id).subscribe({
        next: () => {
          alert('开始卸船成功');
          this.loadData();
        },
        error: (err) => alert(err.error?.message || '操作失败')
      });
    }
  }

  completeUnloading(e: any): void {
    if (confirm('确定完成卸船？')) {
      this.service.completeUnloading(e.row.data.id).subscribe({
        next: () => {
          alert('完成卸船成功');
          this.loadData();
        },
        error: (err) => alert(err.error?.message || '操作失败')
      });
    }
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
      this.service.create(this.formData as CreateBerthPlan).subscribe(() => {
        this.popupVisible = false;
        this.loadData();
      });
    }
  }

  onPopupHidden(): void {
    this.formData = {};
  }

  getStatusText(status: BerthPlanStatus): string {
    const map: Record<BerthPlanStatus, string> = {
      [BerthPlanStatus.Draft]: '草稿',
      [BerthPlanStatus.Scheduled]: '已排期',
      [BerthPlanStatus.Berthing]: '靠泊中',
      [BerthPlanStatus.Unloading]: '卸船中',
      [BerthPlanStatus.Completed]: '已完成',
      [BerthPlanStatus.Cancelled]: '已取消'
    };
    return map[status] || '未知';
  }

  getStatusClass(status: BerthPlanStatus): string {
    const map: Record<BerthPlanStatus, string> = {
      [BerthPlanStatus.Draft]: 'status-badge status-draft',
      [BerthPlanStatus.Scheduled]: 'status-badge status-draft',
      [BerthPlanStatus.Berthing]: 'status-badge status-active',
      [BerthPlanStatus.Unloading]: 'status-badge status-active',
      [BerthPlanStatus.Completed]: 'status-badge status-success',
      [BerthPlanStatus.Cancelled]: 'status-badge status-error'
    };
    return map[status] || 'status-badge';
  }
}
