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

  // Step 1: Group data by `documentNo` and `title`, ensuring unique entries by reviewStep or other criteria
  const groupedData = filtered
    .filter(
      (x) =>
        x.submissionStatus !== "Canceled" &&
        x.stepStatus !== "Terminated"
    )
    .reduce((acc, doc) => {
      // Use documentNo and title as the grouping key
      const uniqueKey = `${doc.documentNo}_${doc.title}`;
      
      // Check if this key exists in the accumulator
      if (!acc[uniqueKey]) {
        // If not, initialize with an array containing the current document
        acc[uniqueKey] = [doc];
      } else {
        // If it exists, just push the document to the group
        acc[uniqueKey].push(doc);
      }

      return acc;
    }, {});

  // Step 2: Flatten grouped data and keep only the documents with the highest revision value
  const processedData = Object.values(groupedData).flatMap((docs) => {
    // Find the maximum revision value in the group
    const maxRevision = Math.max(...docs.map(doc => doc.revision));

    // Filter out documents that do not have the highest revision
    const highestRevisionDocs = docs.filter(doc => doc.revision === maxRevision);

    // Sort the documents by `reviewStep` and `originalDueDate` (chronologically)
    highestRevisionDocs.sort((a, b) => {
      if (a.reviewStep === b.reviewStep) {
        // If the review step is the same, sort by the original due date
        return new Date(a.originalDueDate) - new Date(b.originalDueDate);
      }
      return a.reviewStep - b.reviewStep; // Sort by review step
    });

    // Add step indicator to the title for documents with multiple steps
    return highestRevisionDocs.map((doc, index) => {
      const titleWithStep =
        highestRevisionDocs.length > 1
          ? `${doc.title} - Step ${index + 1}`
          : doc.title;

      return { ...doc, title: titleWithStep };
    });
  });


  // Step 3: Apply pagination using the `processedData`
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
      stepStatus
    } = doc;

    // Parse the dates
    const submissionEndDate = parseDate(dateIn);
    const reviewStartDate = submissionEndDate
      ? new Date(submissionEndDate.getTime() + 24 * 60 * 60 * 1000)
      : null;
    const reviewEndDate = parseDate(dateCompleted);

    let validSubmissionStartDate = parseDate(plannedSubmissionDate) || new Date();
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

    // Add submission row
    rowSet.push([
      title,
      `Submission: ${formatDate(validSubmissionStartDate)} - ${formatDate(validSubmissionEndDate)} ${submissionStatus}`,
      validSubmissionStartDate,
      validSubmissionEndDate,
    ]);

    // Add review row if dates are valid
    if (validReviewStartDate && validReviewEndDate) {
      rowSet.push([
        title,
        `Review: ${formatDate(validReviewStartDate)} - ${formatDate(validReviewEndDate)} ${reviewStatus || stepStatus}`,
        validReviewStartDate,
        validReviewEndDate,
      ]);
    }

    return rowSet.length > 0 ? rowSet : null;
  });

  // Step 4: Filter and normalize rows
  const formattedData = paginatedData.filter((row) => row !== null).map((row) => {
    while (row.length < 4) {
      row.push(null);
    }
    return row;
  });

  // Step 5: Post the result
  postMessage(formattedData);
};










