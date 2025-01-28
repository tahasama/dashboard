// Function to parse the date from Excel-style or string dates
const parseDate = (dateString) => {
  const excelBaseDate = new Date(1899, 11, 30).getTime();
  if (typeof dateString !== "string" && dateString !== null) {
    dateString = String(dateString);
  }

  if (typeof dateString === "string") {
    const trimmedDate = dateString.trim();
    const excelNumber = Number(trimmedDate);
    if (!isNaN(excelNumber) && excelNumber > 0) {
      return new Date(excelBaseDate + excelNumber * 24 * 60 * 60 * 1000);
    }
    if (trimmedDate.includes("/")) {
      const parts = trimmedDate.split("/");
      if (parts.length === 3) {
        const day = parseInt(parts[0], 10);
        const month = parseInt(parts[1], 10) - 1;
        const year = parseInt(parts[2], 10);
        const parsedDate = new Date(year, month, day);
        if (!isNaN(parsedDate.getTime())) {
          return parsedDate;
        }
      }
    }
    const date = new Date(trimmedDate);
    if (!isNaN(date.getTime())) {
      return date;
    }
  }
  return null;
};

// Function to format the date
const formatDate = (date) => {
  if (!date || isNaN(date.getTime())) return "";
  const day = String(date.getDate()).padStart(2, "0");
  const months = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];
  const month = months[date.getMonth()];
  return `${day} ${month}`;
};

self.onmessage = function (event) {
  const { filtered, currentPage, rowsPerPage } = event.data;

  const uniqueData = [
    ...new Set(
      filtered
        .filter(
          (x) =>
            x.submissionStatus !== "Canceled" &&
            x.stepStatus !== "Terminated"
        )
        .map((x) => x.documentNo)
    ),
  ];

  const startIndex = currentPage * rowsPerPage;
  const endIndex = startIndex + rowsPerPage;

  const paginatedData = uniqueData.slice(startIndex, endIndex).map((docNo) => {
    const item = filtered.find((x) => x.documentNo === docNo);
    if (!item) return null;  // Skip if no item is found

    const {
      title,
      plannedSubmissionDate,
      dateIn,
      dateCompleted,
      submissionStatus,
      reviewStatus,
    } = item;

    // Parse the dates using your parseDate function
    const submissionEndDate = parseDate(dateIn);
    const reviewStartDate = submissionEndDate
      ? new Date(submissionEndDate.getTime() + 24 * 60 * 60 * 1000)
      : null;
    const reviewEndDate = parseDate(dateCompleted);

    // Ensure that dates are valid
    let validSubmissionStartDate = parseDate(plannedSubmissionDate) || new Date();
    let validSubmissionEndDate = submissionEndDate || new Date();
    let validReviewStartDate = reviewStartDate || new Date();
    let validReviewEndDate = reviewEndDate || new Date();

    // Fix the dates if submission is in the future
    if (plannedSubmissionDate && validSubmissionStartDate > new Date()) {
      validSubmissionStartDate =
        validSubmissionEndDate =
        validReviewStartDate =
        validReviewEndDate =
          validSubmissionStartDate;
    }

    // Ensure the start dates are not after the end dates
    if (validSubmissionStartDate > validSubmissionEndDate) {
      validSubmissionStartDate = validSubmissionEndDate;
    }
    if (validReviewStartDate > validReviewEndDate) {
      validReviewStartDate = validReviewEndDate;
    }

    // Create the row set with formatted dates and Date objects
    const rowSet = [
      [
        title,
        `Submission: ${formatDate(validSubmissionStartDate)} - ${formatDate(validSubmissionEndDate)} ${submissionStatus}`,
        validSubmissionStartDate, // Date object for the first date
        validSubmissionEndDate,   // Date object for the second date
      ],
    ];

    // Add the review row if dates are valid
    if (validReviewStartDate && validReviewEndDate) {
      rowSet.push([
        title,
        `Review: ${formatDate(validReviewStartDate)} - ${formatDate(validReviewEndDate)} ${reviewStatus || "Approved"}`,
        validReviewStartDate, // Date object for the first review date
        validReviewEndDate,   // Date object for the second review date
      ]);
    }

    return rowSet.length > 0 ? rowSet : null;  // Only return valid rows
  });

  // Ensure all rows are valid (no null rows)
  const formattedData = paginatedData.filter((row) => row !== null).map((row) => {
    // Ensure all rows have 4 columns
    while (row.length < 4) {
      row.push(null);
    }
    return row;
  });
  // console.log("🚀 ~ formattedData ~ formattedData:", formattedData[10])

  postMessage(formattedData); // Send back the filtered and paginated data
};


