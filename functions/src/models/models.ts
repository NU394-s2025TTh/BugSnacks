import {
  BugReportSeverity,
  BugReportStatus,
  RewardType,
  TestRequestStatus,
} from './enums';

// --- User Interface ---
export interface User extends Record<string, unknown> {
  readonly userId: string; // Corresponds to Firestore Document ID
  readonly username: string;
  readonly email: string;
  readonly campusId: string;
  readonly name?: string; // Optional display name
  readonly createdAt: Date; // Use JS Date object in the interface
}

export interface Reward extends Record<string, unknown> {
  readonly rewardId: string; // Corresponds to Firestore Document ID
  readonly name: string;
  readonly description?: string;
  readonly location: string;
  readonly type: RewardType;
  readonly time?: Date;
}

// --- Campus Interface ---
export interface Campus extends Record<string, unknown> {
  readonly campusId: string; // Corresponds to Firestore Document ID
  readonly name: string;
  readonly rewardLocations: Array<Reward>;
}

// --- Project Interface ---
export interface Project extends Record<string, unknown> {
  readonly projectId: string; // Corresponds to Firestore Document ID
  readonly developerId: string; // Foreign key to User
  readonly campusId: string; // Foreign key to Campus
  readonly name: string;
  readonly description: string;
  readonly platform?: string;
  readonly createdAt: Date;
}

// --- TestRequest Interface ---
export interface TestRequest extends Record<string, unknown> {
  readonly requestId: string; // Corresponds to Firestore Document ID
  readonly projectId: string; // Foreign key to Project
  readonly developerId: string; // Foreign key to User
  readonly title: string;
  readonly description: string;
  readonly demoUrl: string;
  readonly reward: Reward | Array<Reward>;
  readonly status: TestRequestStatus;
  readonly createdAt: Date;
}

// --- BugReport Interface ---
export interface BugReport extends Record<string, unknown> {
  readonly reportId: string; // Corresponds to Firestore Document ID
  readonly requestId: string; // Foreign key to TestRequest
  readonly testerId: string; // Foreign key to User
  readonly title: string;
  readonly description: string; // Includes steps to reproduce
  readonly severity: BugReportSeverity;
  readonly proposedReward: Reward;
  readonly status: BugReportStatus;
  readonly attachments: string[]; // List of IDs in Storage
  readonly createdAt: Date;
}
