export type Data = { data: MergedData[] };

export type MergedData = {
  // Unified columns
  documentNo: string; // Document number (from both files)
  title: string; // Document title (from both files)

  // Fields specific to each file
  assignedTo?: string; // Assigned To (file 2)
  stepStatus?: string; // Step Status (file 2)
  originalDueDate?: string | number; // Original Due Date (file 2)

  // Days Late fields from both files
  daysLateSubmission?: number; // Days Late (file 1)
  daysLateReview?: string; // Days Late (file 2)
  stepOutcome?: string;
  // Columns from file 1
  submissionStatus?: string; // Submission Status
  reviewStatus?: string; // Review Status
  createdBy?: string; // Created By
  plannedSubmissionDate?: string | number; // Planned Submission Date
  dateIn?: string | number; // Date In
  selectList1?: string; // Select List 1
  selectList3?: string; // Select List 3
  selectList5?: string; // Select List 5
  status?: string; // Status
  workflowStatus?: string; // Workflow Status
  dateCompleted?: string; // Date Completed
};
