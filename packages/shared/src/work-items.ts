export type WorkItemType = "BUG" | "FEATURE";

export type PipelineStatusKey = "REPORTED" | "IN_PROGRESS" | "IN_REVIEW" | "DONE";

export interface BugDetailsDraft {
  readonly stepsToReproduce: string;
  readonly expectedBehavior: string;
  readonly actualBehavior: string;
}

export interface FeatureDetailsDraft {
  readonly userStory: string;
  readonly acceptanceCriteria: string;
  readonly businessValue: string;
}

export interface WorkItemDraft {
  readonly type: WorkItemType;
  readonly title: string;
  readonly description: string;
  readonly projectId: string;
  readonly reporterId: string;
  readonly assigneeId?: string;
  readonly releaseTargetId?: string;
  readonly bugDetails?: BugDetailsDraft;
  readonly featureDetails?: FeatureDetailsDraft;
}
