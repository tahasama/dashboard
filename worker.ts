import { MergedData } from "./app/types";

self.onmessage = function (event) {
  const { filtered, currentPage, rowsPerPage } = event.data;

  const uniqueData = [
    ...new Set(
      filtered
        .filter(
          (x:MergedData) =>
            x.submissionStatus !== "Canceled" &&
            x.stepStatus !== "Terminated"
        )
        .map((x:MergedData) => x.documentNo)
    ),
  ];

  const startIndex = currentPage * rowsPerPage;
  const endIndex = startIndex + rowsPerPage;

  const paginatedData = uniqueData.slice(startIndex, endIndex).map((docNo) => {
    const item = filtered.find((x:MergedData) => x.documentNo === docNo);
    if (!item) return null;

    const {
      title,
      plannedSubmissionDate,
      dateIn,
      dateCompleted,
      submissionStatus,
      reviewStatus,
    } = item;

    const submissionEndDate = new Date(dateIn);
    const reviewStartDate = submissionEndDate
      ? new Date(submissionEndDate.getTime() + 24 * 60 * 60 * 1000)
      : null;
    const reviewEndDate = new Date(dateCompleted);

    let validSubmissionStartDate = new Date(plannedSubmissionDate) || new Date();
    let validSubmissionEndDate = submissionEndDate || new Date();
    let validReviewStartDate = reviewStartDate || new Date();
    let validReviewEndDate = reviewEndDate || new Date();

    if (plannedSubmissionDate && validSubmissionStartDate > new Date()) {
      validSubmissionStartDate =
        validSubmissionEndDate =
        validReviewStartDate =
        validReviewEndDate =
          validSubmissionStartDate;
    }

    if (validSubmissionStartDate > validSubmissionEndDate) {
      validSubmissionStartDate = validSubmissionEndDate;
    }
    if (validReviewStartDate > validReviewEndDate) {
      validReviewStartDate = validReviewEndDate;
    }

    const rowSet = [
      [
        title,
        `Submission: ${validSubmissionStartDate} - ${validSubmissionEndDate} ${submissionStatus}`,
        validSubmissionStartDate,
        validSubmissionEndDate,
      ],
    ];

    if (validReviewStartDate && validReviewEndDate) {
      rowSet.push([
        title,
        `Review: ${validReviewStartDate} - ${validReviewEndDate} ${
          reviewStatus || "Approved"
        }`,
        validReviewStartDate,
        validReviewEndDate,
      ]);
    }

    return rowSet;
  });

  postMessage(paginatedData.filter(Boolean)); // Send back the filtered and paginated data
};
