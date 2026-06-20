export enum BerthPlanStatus {
  Draft = 0,
  Scheduled = 1,
  Berthing = 2,
  Unloading = 3,
  Completed = 4,
  Cancelled = 5
}

export interface BerthPlan {
  id: string;
  planNo: string;
  vesselName: string;
  vesselImoNo: string;
  berthNo?: string;
  eta?: Date;
  etd?: Date;
  actualBerthingTime?: Date;
  actualUnloadingStartTime?: Date;
  actualUnloadingEndTime?: Date;
  plannedQuantity?: number;
  cargoType?: string;
  shipper?: string;
  consignee?: string;
  dispatcher?: string;
  status: BerthPlanStatus;
  remark?: string;
}

export interface CreateBerthPlan {
  planNo: string;
  vesselName: string;
  vesselImoNo: string;
  berthNo?: string;
  eta?: Date;
  etd?: Date;
  plannedQuantity?: number;
  cargoType?: string;
  shipper?: string;
  consignee?: string;
  dispatcher?: string;
  remark?: string;
}

export interface UpdateBerthPlan {
  berthNo?: string;
  eta?: Date;
  etd?: Date;
  actualBerthingTime?: Date;
  actualUnloadingStartTime?: Date;
  actualUnloadingEndTime?: Date;
  plannedQuantity?: number;
  cargoType?: string;
  dispatcher?: string;
  status?: BerthPlanStatus;
  remark?: string;
}
