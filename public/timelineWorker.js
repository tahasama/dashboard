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

  // Step 1: Group data by `documentNo` and `title`
  const groupedData = filtered.reduce((acc, doc) => {
    const uniqueKey = `${doc.documentNo}_${doc.title}`;
    if (!acc[uniqueKey]) {
      acc[uniqueKey] = [];
    }
    acc[uniqueKey].push(doc); // Keep all revisions
    return acc;
  }, {});

  // Step 2: Flatten all revisions into a single array (KEEP ALL REVISIONS)
  const processedData = Object.values(groupedData).flatMap((docs) => docs);

  // Step 3: Apply pagination
  const startIndex = currentPage * rowsPerPage;
  const endIndex = startIndex + rowsPerPage;

  const paginatedData = processedData.slice(startIndex, endIndex).map((doc) => {
    const rowSet = [];

    const {
      title,
      plannedSubmissionDate,
      dateIn,
      dateCompleted,
      submissionStatus,
      reviewStatus,
      stepOutcome,
      revision,
      documentNo,
    } = doc;

    const revisionNumber = Number(revision);

    // Determine submission start date for Revision 0
    let validSubmissionStartDate;
    let validSubmissionEndDate;

    if (revisionNumber === 0) {
      validSubmissionStartDate = parseDate(plannedSubmissionDate) || new Date(); // Use plannedSubmissionDate for Revision 0
      validSubmissionEndDate = parseDate(dateIn) || new Date(); // Use dateIn for Revision 0
    } else {
      validSubmissionStartDate = parseDate(dateIn) || new Date(); // Use dateIn for higher revisions
      validSubmissionEndDate = parseDate(dateIn) || new Date(); // Use dateIn as submission end date for higher revisions
    }

    // Determine review dates
    let validReviewStartDate = validSubmissionEndDate
      ? new Date(validSubmissionEndDate.getTime() + 24 * 60 * 60 * 1000) // Set review start date after submission end date
      : null;
    let validReviewEndDate = parseDate(dateCompleted);

    if (!validReviewStartDate) {
      validReviewStartDate = new Date();
    }
    if (!validReviewEndDate) {
      validReviewEndDate = new Date();
    }

    // Ensure start dates are not after end dates
    if (validSubmissionStartDate > validSubmissionEndDate) {
      validSubmissionStartDate = validSubmissionEndDate;
    }
    if (validReviewStartDate > validReviewEndDate) {
      validReviewStartDate = validReviewEndDate;
    }

    // Add an hour to ReviewStartDate and ReviewEndDate if they are the same
    if (validReviewStartDate.getTime() === validReviewEndDate.getTime()) {
      validReviewEndDate.setHours(validReviewEndDate.getHours() + 1); // Add 1 hour to ensure visibility
    }

    const aheadOfPlanning =
      parseDate(plannedSubmissionDate) > parseDate(dateIn)
        ? `(Ahead of Planning ${formatDate(parseDate(plannedSubmissionDate))}) `
        : "";
    // Add submission row
    const titleWithDocNo = `${title}${String.fromCharCode(160).repeat(100)} - ${
      documentNo.split("-")[2]
    }`;

    rowSet.push([
      titleWithDocNo,
      `Submission: ${formatDate(validSubmissionStartDate)} - ${formatDate(
        validSubmissionEndDate
      )} - ${submissionStatus} - rev ${revision} ${aheadOfPlanning}`,
      validSubmissionStartDate,
      validSubmissionEndDate,
    ]);

    // Add review row if dates are valid
    if (validReviewStartDate && validReviewEndDate) {
      rowSet.push([
        titleWithDocNo,
        `Review: ${formatDate(validReviewStartDate)} - ${formatDate(
          validReviewEndDate
        )} - ${reviewStatus || stepOutcome} - rev ${revision}`,
        validReviewStartDate,
        validReviewEndDate,
      ]);
    }

    return rowSet.length > 0 ? rowSet : null;
  });

  // Step 4: Filter and normalize rows
  const formattedData = paginatedData
    .filter((row) => row !== null)
    .map((row) => {
      while (row.length < 4) {
        row.push(null);
      }
      return row;
    });

  // Step 5: Post the result
  postMessage(formattedData);
};
