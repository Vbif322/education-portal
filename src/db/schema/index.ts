// Existing tables
export * from "./course";
export * from "./courseAccess";
export * from "./coursesToModules";
export * from "./lesson";
export * from "./lessonAccess";
export * from "./module";
export * from "./modulesToLessons";
export * from "./users";
export * from "./usersToCourses";
export * from "./usersToLessons";

// Analytics tables
export * from "./analytics/videoEvents";
export * from "./analytics/userActivity";
export * from "./analytics/userVisits";

// Audit tables
export * from "./audit/adminActions";
export * from "./audit/accessLogs";
export * from "./audit/errorLogs";
export * from "./audit/performanceLogs";
