import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { BerthPlanService } from '../../services/berth-plan.service';
import { BerthPlanDetail, BerthPlanStatus } from '../../models/berth-plan.model';
import { ShutdownStatus, ShutdownType } from '../../models/shutdown-event.model';
import { PipelinePurgeStatus } from '../../models/pipeline-purge.model';
import { MeteringStatus } from '../../models/metering-record.model';

@Component({
  selector: 'app-berth-plan-detail',
  template: `
    <div class="page-container">
      <div class="detail-header">
        <div class="header-left">
          <dx-button icon="back" text="返回列表" (onClick)="goBack()"></dx-button>
          <h2 class="page-title">卸船详情 - {{ detail?.planNo }}</h2>
        </div>
        <div class="header-right">
          <span [class]="getStatusClass(detail?.status!)">{{ getStatusText(detail?.status!) }}</span>
        </div>
      </div>

      <div *ngIf="loading" class="loading">加载中...</div>
      <div *ngIf="error" class="error">{{ error }}</div>

      <div *ngIf="detail && !loading" class="detail-content">
        <dx-tab-panel [selectedIndex]="0">
          <dxi-item title="基本信息">
            <div class="tab-content">
              <div class="info-grid">
                <div class="info-item">
                  <label>计划编号</label>
                  <span>{{ detail.planNo }}</span>
                </div>
                <div class="info-item">
                  <label>船名</label>
                  <span>{{ detail.vesselName }}</span>
                </div>
                <div class="info-item">
                  <label>IMO编号</label>
                  <span>{{ detail.vesselImoNo }}</span>
                </div>
                <div class="info-item">
                  <label>泊位号</label>
                  <span>{{ detail.berthNo || '-' }}</span>
                </div>
                <div class="info-item">
                  <label>预计到港</label>
                  <span>{{ formatDate(detail.eta) }}</span>
                </div>
                <div class="info-item">
                  <label>预计离港</label>
                  <span>{{ formatDate(detail.etd) }}</span>
                </div>
                <div class="info-item">
                  <label>实际靠泊</label>
                  <span>{{ formatDate(detail.actualBerthingTime) }}</span>
                </div>
                <div class="info-item">
                  <label>开始卸船</label>
                  <span>{{ formatDate(detail.actualUnloadingStartTime) }}</span>
                </div>
                <div class="info-item">
                  <label>完成卸船</label>
                  <span>{{ formatDate(detail.actualUnloadingEndTime) }}</span>
                </div>
                <div class="info-item">
                  <label>计划数量(吨)</label>
                  <span>{{ detail.plannedQuantity || '-' }}</span>
                </div>
                <div class="info-item">
                  <label>货物类型</label>
                  <span>{{ detail.cargoType || '-' }}</span>
                </div>
                <div class="info-item">
                  <label>发货人</label>
                  <span>{{ detail.shipper || '-' }}</span>
                </div>
                <div class="info-item">
                  <label>收货人</label>
                  <span>{{ detail.consignee || '-' }}</span>
                </div>
                <div class="info-item">
                  <label>调度员</label>
                  <span>{{ detail.dispatcher || '-' }}</span>
                </div>
                <div class="info-item full-width">
                  <label>备注</label>
                  <span>{{ detail.remark || '-' }}</span>
                </div>
              </div>
            </div>
          </dxi-item>

          <dxi-item [title]="'异常停输 (' + detail.shutdownEvents.length + ')'">
            <div class="tab-content">
              <div *ngIf="detail.shutdownEvents.length === 0" class="empty-state">
                暂无异常停输记录
              </div>
              <div *ngFor="let event of detail.shutdownEvents" class="card">
                <div class="card-header">
                  <span class="card-title">{{ event.shutdownNo }} - {{ getShutdownTypeText(event.shutdownType) }}</span>
                  <span [class]="getShutdownStatusClass(event.status)">{{ getShutdownStatusText(event.status) }}</span>
                </div>
                <div class="card-body">
                  <div class="info-grid">
                    <div class="info-item">
                      <label>停输时间</label>
                      <span>{{ formatDate(event.shutdownTime) }}</span>
                    </div>
                    <div class="info-item">
                      <label>恢复时间</label>
                      <span>{{ formatDate(event.resumeTime) }}</span>
                    </div>
                    <div class="info-item">
                      <label>持续时间</label>
                      <span>{{ formatDuration(event.duration) }}</span>
                    </div>
                    <div class="info-item">
                      <label>位置</label>
                      <span>{{ event.location || '-' }}</span>
                    </div>
                    <div class="info-item">
                      <label>操作员</label>
                      <span>{{ event.operator || '-' }}</span>
                    </div>
                    <div class="info-item">
                      <label>恢复条件记录</label>
                      <span [style.color]="event.recoveryConditionRecorded ? '#2e7d32' : '#c62828'">
                        {{ event.recoveryConditionRecorded ? '已记录' : '未记录' }}
                      </span>
                    </div>
                    <div class="info-item full-width">
                      <label>停输描述</label>
                      <span>{{ event.description }}</span>
                    </div>
                    <div class="info-item full-width" *ngIf="event.cause">
                      <label>原因分析</label>
                      <span>{{ event.cause }}</span>
                    </div>
                    <div class="info-item full-width" *ngIf="event.recoveryCondition">
                      <label class="highlight">恢复前置条件</label>
                      <span class="highlight-text">{{ event.recoveryCondition }}</span>
                    </div>
                    <div class="info-item full-width" *ngIf="event.recoveryMeasures">
                      <label>处置措施</label>
                      <span>{{ event.recoveryMeasures }}</span>
                    </div>
                    <div class="info-item full-width" *ngIf="event.remark">
                      <label>备注</label>
                      <span>{{ event.remark }}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </dxi-item>

          <dxi-item [title]="'管线置换 (' + detail.pipelinePurges.length + ')'">
            <div class="tab-content">
              <div *ngIf="detail.pipelinePurges.length === 0" class="empty-state">
                暂无管线置换记录
              </div>
              <div *ngFor="let purge of detail.pipelinePurges" class="card">
                <div class="card-header">
                  <span class="card-title">{{ purge.purgeNo }} - {{ purge.pipelineName }}</span>
                  <span [class]="getPurgeStatusClass(purge.status)">{{ getPurgeStatusText(purge.status) }}</span>
                </div>
                <div class="card-body">
                  <div class="info-grid">
                    <div class="info-item">
                      <label>开始时间</label>
                      <span>{{ formatDate(purge.purgeStartTime) }}</span>
                    </div>
                    <div class="info-item">
                      <label>结束时间</label>
                      <span>{{ formatDate(purge.purgeEndTime) }}</span>
                    </div>
                    <div class="info-item">
                      <label>氧含量(%)</label>
                      <span>{{ purge.oxygenContent != null ? purge.oxygenContent : '-' }}</span>
                    </div>
                    <div class="info-item">
                      <label>检测时间</label>
                      <span>{{ formatDate(purge.oxygenTestTime) }}</span>
                    </div>
                    <div class="info-item">
                      <label>合格标准(%)</label>
                      <span>{{ purge.oxygenLimit }}</span>
                    </div>
                    <div class="info-item">
                      <label>工艺工程师</label>
                      <span>{{ purge.processEngineer || '-' }}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </dxi-item>

          <dxi-item [title]="'计量交接 (' + detail.meteringRecords.length + ')'">
            <div class="tab-content">
              <div *ngIf="detail.meteringRecords.length === 0" class="empty-state">
                暂无计量交接记录
              </div>
              <div *ngFor="let record of detail.meteringRecords" class="card">
                <div class="card-header">
                  <span class="card-title">{{ record.meteringNo }}</span>
                  <span [class]="getMeteringStatusClass(record.status)">{{ getMeteringStatusText(record.status) }}</span>
                </div>
                <div class="card-body">
                  <div class="info-grid">
                    <div class="info-item">
                      <label>开始时间</label>
                      <span>{{ formatDate(record.meteringStartTime) }}</span>
                    </div>
                    <div class="info-item">
                      <label>结束时间</label>
                      <span>{{ formatDate(record.meteringEndTime) }}</span>
                    </div>
                    <div class="info-item">
                      <label>装船量(吨)</label>
                      <span>{{ record.loadingQuantity || '-' }}</span>
                    </div>
                    <div class="info-item">
                      <label>卸船量(吨)</label>
                      <span>{{ record.unloadingQuantity || '-' }}</span>
                    </div>
                    <div class="info-item">
                      <label>船方量(吨)</label>
                      <span>{{ record.shipFigureQuantity || '-' }}</span>
                    </div>
                    <div class="info-item">
                      <label>岸方量(吨)</label>
                      <span>{{ record.shoreFigureQuantity || '-' }}</span>
                    </div>
                    <div class="info-item">
                      <label>差异量(吨)</label>
                      <span [class]="record.isDifferenceExceeded ? 'text-error' : ''">
                        {{ record.differenceAmount != null ? record.differenceAmount.toFixed(3) : '-' }}
                      </span>
                    </div>
                    <div class="info-item">
                      <label>差异率(%)</label>
                      <span [class]="record.isDifferenceExceeded ? 'text-error' : ''">
                        {{ record.differenceRate != null ? record.differenceRate.toFixed(3) : '-' }}
                      </span>
                    </div>
                    <div class="info-item">
                      <label>计量员</label>
                      <span>{{ record.meteringOperator || '-' }}</span>
                    </div>
                    <div class="info-item">
                      <label>审核人</label>
                      <span>{{ record.reviewer || '-' }}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </dxi-item>
        </dx-tab-panel>
      </div>
    </div>
  `,
  styles: [`
    .detail-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 20px;
    }
    .header-left {
      display: flex;
      align-items: center;
      gap: 16px;
    }
    .page-title {
      margin: 0;
    }
    .tab-content {
      padding: 20px 0;
    }
    .info-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
      gap: 16px;
    }
    .info-item {
      display: flex;
      flex-direction: column;
      gap: 4px;
    }
    .info-item.full-width {
      grid-column: 1 / -1;
    }
    .info-item label {
      font-weight: 500;
      color: #666;
      font-size: 13px;
    }
    .info-item label.highlight {
      color: #1565c0;
      font-weight: 600;
    }
    .info-item span {
      color: #333;
      font-size: 14px;
      line-height: 1.6;
    }
    .info-item span.highlight-text {
      color: #1565c0;
      font-weight: 500;
      background: #e3f2fd;
      padding: 8px 12px;
      border-radius: 4px;
      border-left: 3px solid #1565c0;
    }
    .card {
      background: #fff;
      border: 1px solid #e0e0e0;
      border-radius: 8px;
      margin-bottom: 16px;
      overflow: hidden;
    }
    .card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 12px 16px;
      background: #f5f5f5;
      border-bottom: 1px solid #e0e0e0;
    }
    .card-title {
      font-weight: 600;
      color: #333;
    }
    .card-body {
      padding: 16px;
    }
    .empty-state {
      text-align: center;
      padding: 40px;
      color: #999;
    }
    .loading, .error {
      text-align: center;
      padding: 40px;
    }
    .error {
      color: #c62828;
    }
    .text-error {
      color: #c62828 !important;
      font-weight: 600;
    }
  `]
})
export class BerthPlanDetailComponent implements OnInit {
  detail: BerthPlanDetail | null = null;
  loading = true;
  error: string | null = null;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private service: BerthPlanService
  ) { }

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.loadDetail(id);
    } else {
      this.error = '无效的参数';
      this.loading = false;
    }
  }

  loadDetail(id: string): void {
    this.loading = true;
    this.error = null;
    this.service.getDetailById(id).subscribe({
      next: (data) => {
        this.detail = data;
        this.loading = false;
      },
      error: (err) => {
        this.error = err.error?.message || '加载失败';
        this.loading = false;
      }
    });
  }

  goBack(): void {
    this.router.navigate(['/berth-plans']);
  }

  formatDate(date: Date | string | undefined): string {
    if (!date) return '-';
    const d = new Date(date);
    return d.toLocaleString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  formatDuration(duration: any): string {
    if (!duration) return '-';
    if (typeof duration === 'string') {
      const parts = duration.split(':');
      if (parts.length >= 2) {
        return `${parts[0]}小时${parts[1]}分钟`;
      }
    }
    return '-';
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

  getShutdownTypeText(type: ShutdownType): string {
    const map: Record<ShutdownType, string> = {
      [ShutdownType.EquipmentFailure]: '设备故障',
      [ShutdownType.SafetyIncident]: '安全事件',
      [ShutdownType.Weather]: '天气原因',
      [ShutdownType.Operational]: '操作原因',
      [ShutdownType.Other]: '其他'
    };
    return map[type] || '未知';
  }

  getShutdownStatusText(status: ShutdownStatus): string {
    const map: Record<ShutdownStatus, string> = {
      [ShutdownStatus.Occurred]: '已发生',
      [ShutdownStatus.Processing]: '处置中',
      [ShutdownStatus.Recovering]: '恢复中',
      [ShutdownStatus.Resumed]: '已恢复',
      [ShutdownStatus.Closed]: '已关闭'
    };
    return map[status] || '未知';
  }

  getShutdownStatusClass(status: ShutdownStatus): string {
    const map: Record<ShutdownStatus, string> = {
      [ShutdownStatus.Occurred]: 'status-badge status-error',
      [ShutdownStatus.Processing]: 'status-badge status-warning',
      [ShutdownStatus.Recovering]: 'status-badge status-active',
      [ShutdownStatus.Resumed]: 'status-badge status-success',
      [ShutdownStatus.Closed]: 'status-badge status-draft'
    };
    return map[status] || 'status-badge';
  }

  getPurgeStatusText(status: PipelinePurgeStatus): string {
    const map: Record<PipelinePurgeStatus, string> = {
      [PipelinePurgeStatus.Pending]: '待开始',
      [PipelinePurgeStatus.InProgress]: '进行中',
      [PipelinePurgeStatus.OxygenTesting]: '氧含量检测',
      [PipelinePurgeStatus.Qualified]: '检测合格',
      [PipelinePurgeStatus.Failed]: '检测不合格',
      [PipelinePurgeStatus.Confirmed]: '已确认'
    };
    return map[status] || '未知';
  }

  getPurgeStatusClass(status: PipelinePurgeStatus): string {
    const map: Record<PipelinePurgeStatus, string> = {
      [PipelinePurgeStatus.Pending]: 'status-badge status-draft',
      [PipelinePurgeStatus.InProgress]: 'status-badge status-active',
      [PipelinePurgeStatus.OxygenTesting]: 'status-badge status-warning',
      [PipelinePurgeStatus.Qualified]: 'status-badge status-success',
      [PipelinePurgeStatus.Failed]: 'status-badge status-error',
      [PipelinePurgeStatus.Confirmed]: 'status-badge status-success'
    };
    return map[status] || 'status-badge';
  }

  getMeteringStatusText(status: MeteringStatus): string {
    const map: Record<MeteringStatus, string> = {
      [MeteringStatus.Draft]: '草稿',
      [MeteringStatus.Submitted]: '已提交',
      [MeteringStatus.ReviewRequired]: '待审核',
      [MeteringStatus.Reviewed]: '已审核',
      [MeteringStatus.Confirmed]: '已确认',
      [MeteringStatus.Rejected]: '已驳回'
    };
    return map[status] || '未知';
  }

  getMeteringStatusClass(status: MeteringStatus): string {
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
