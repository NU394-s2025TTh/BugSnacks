// All comments made in the file were done by OpenAI's o4-mini model
/**
 * Defines string-based enumeration types for various domain-specific values:
 *   - TestRequestStatus: possible states of a test request.
 *   - BugReportSeverity: severity levels for bug reports.
 *   - BugReportStatus: stages in the bug report handling process.
 *   - RewardType: types of rewards that can be issued.
 *   - Platform: supported client platforms.
 */
export enum TestRequestStatus {
  OPEN = 'OPEN',
  CLOSED = 'CLOSED',
}

export enum BugReportSeverity {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
}

export enum BugReportStatus {
  SUBMITTED = 'SUBMITTED',
  VALIDATED = 'VALIDATED',
  REJECTED = 'REJECTED',
  REWARDED = 'REWARDED',
}

export enum RewardType {
  GUEST_SWIPE = 'GUEST_SWIPE',
  MEAL_EXCHANGE = 'MEAL_EXCHANGE',
}

export enum Platform {
  IOS = 'IOS',
  ANDROID = 'ANDROID',
  WEB = 'WEB',
}
