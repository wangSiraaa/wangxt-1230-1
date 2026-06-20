export enum MeteringStatus {
  Draft = 0,
  Submitted = 1,
  ReviewRequired = 2,
  Reviewed = 3,
  Confirmed = 4,
  Rejected = 5
}

export interface MeteringRecord {
  id: string;
  berthPlanId: string;
  meteringNo: string;
  meteringStartTime?: Date;
  meteringEndTime?: Date;
  loadingQuantity?: number;
  unloadingQuantity?: number;
  shipFigureQuantity?: number;
  shoreFigureQuantity?: number;
  differenceAmount?: number;
  differenceRate?: number;
  differenceLimitRate: number;
  isDifferenceExceeded: boolean;
  meteringOperator?: string;
  reviewer?: string;
  reviewTime?: Date;
  reviewComment?: string;
  status: MeteringStatus;
  remark?: string;
}

export interface CreateMeteringRecord {
  berthPlanId: string;
  meteringNo: string;
  meteringStartTime?: Date;
  meteringEndTime?: Date;
  loadingQuantity?: number;
  unloadingQuantity?: number;
  shipFigureQuantity?: number;
  shoreFigureQuantity?: number;
  differenceLimitRate: number;
  meteringOperator?: string;
  remark?: string;
}

export interface UpdateMeteringRecord {
  meteringStartTime?: Date;
  meteringEndTime?: Date;
  loadingQuantity?: number;
  unloadingQuantity?: number;
  shipFigureQuantity?: number;
  shoreFigureQuantity?: number;
  meteringOperator?: string;
  remark?: string;
}

export interface ReviewMetering {
  reviewer: string;
  reviewComment: string;
  isApproved: boolean;
}
