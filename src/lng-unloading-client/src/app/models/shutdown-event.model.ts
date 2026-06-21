export enum ShutdownStatus {
  Occurred = 0,
  Processing = 1,
  Recovering = 2,
  Resumed = 3,
  Closed = 4
}

export enum ShutdownType {
  EquipmentFailure = 0,
  SafetyIncident = 1,
  Weather = 2,
  Operational = 3,
  Other = 4
}

export interface ShutdownEvent {
  id: string;
  berthPlanId: string;
  shutdownNo: string;
  shutdownType: ShutdownType;
  shutdownTime: Date;
  resumeTime?: Date;
  duration?: any;
  location?: string;
  description: string;
  cause?: string;
  recoveryCondition?: string;
  recoveryMeasures?: string;
  recoveryConditionRecorded: boolean;
  operator?: string;
  status: ShutdownStatus;
  remark?: string;
}

export interface CreateShutdownEvent {
  berthPlanId: string;
  shutdownNo: string;
  shutdownType: ShutdownType;
  shutdownTime: Date;
  location?: string;
  description: string;
  cause?: string;
  recoveryCondition?: string;
  recoveryMeasures?: string;
  operator?: string;
  remark?: string;
}

export interface UpdateShutdownEvent {
  shutdownType?: ShutdownType;
  shutdownTime?: Date;
  resumeTime?: Date;
  location?: string;
  description?: string;
  cause?: string;
  recoveryCondition?: string;
  recoveryMeasures?: string;
  operator?: string;
  status?: ShutdownStatus;
  remark?: string;
}

export interface RecordRecoveryCondition {
  recoveryCondition: string;
  recoveryMeasures?: string;
  resumeTime?: Date;
}
