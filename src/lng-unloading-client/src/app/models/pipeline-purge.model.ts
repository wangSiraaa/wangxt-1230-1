export enum PipelinePurgeStatus {
  Pending = 0,
  InProgress = 1,
  OxygenTesting = 2,
  Qualified = 3,
  Failed = 4,
  Confirmed = 5
}

export interface PipelinePurge {
  id: string;
  berthPlanId: string;
  purgeNo: string;
  pipelineName: string;
  purgeStartTime?: Date;
  purgeEndTime?: Date;
  oxygenContent?: number;
  oxygenTestTime?: Date;
  oxygenLimit: number;
  purgeMedium?: string;
  pressure?: number;
  temperature?: number;
  processEngineer?: string;
  status: PipelinePurgeStatus;
  remark?: string;
}

export interface CreatePipelinePurge {
  berthPlanId: string;
  purgeNo: string;
  pipelineName: string;
  purgeStartTime?: Date;
  oxygenLimit: number;
  purgeMedium?: string;
  processEngineer?: string;
  remark?: string;
}

export interface UpdatePipelinePurge {
  purgeStartTime?: Date;
  purgeEndTime?: Date;
  oxygenContent?: number;
  oxygenTestTime?: Date;
  pressure?: number;
  temperature?: number;
  processEngineer?: string;
  status?: PipelinePurgeStatus;
  remark?: string;
}

export interface ConfirmPurge {
  oxygenContent: number;
  oxygenTestTime: Date;
  processEngineer: string;
}
