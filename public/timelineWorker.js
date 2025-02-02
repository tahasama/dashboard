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

const getStatusColor = (status) => {
  switch (status?.toLowerCase()) {
    case "submitted":
      return "blue";
    case "completed":
      return "yellow";
    case "":
      return "gray";
    case "under review":
      return "green";
    case "c1 reviewed & accepted as final & certified":
      return "red";
    case "c2 reviewed & accepted as marked revise & resubmi":
      return "pink";
    case "c3 reviewed & returned correct and resubmit":
      return "purple";
    case "c4 review not required for information only":
      return "#A9A9A9";
    case "submission required":
      return "magenta";
    default:
      console.warn("Unknown status:", status);
      return "black";
  }
};

// Helper function to format dates
const formatDate = (date) => {
  return `${date.getDate()} ${date.toLocaleString('default', { month: 'short' })} ${date.getFullYear()}`;
};

// Helper function to calculate the date difference in days
const getDateDifference = (startDate, endDate) => {
  const diffTime = Math.abs(endDate - startDate);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
};

// Helper function to calculate the difference in months
const getMonthDifference = (startDate, endDate) => {
  const startMonth = startDate.getFullYear() * 12 + startDate.getMonth();
  const endMonth = endDate.getFullYear() * 12 + endDate.getMonth();
  const diffMonths = endMonth - startMonth;
  return diffMonths;
};

self.onmessage = function (event) {
  const { filtered, currentPage, rowsPerPage } = event.data;

  // Group data by documentNo
  const groupedData = filtered.reduce((acc, doc) => {
    if (!acc[doc.documentNo]) {
      acc[doc.documentNo] = [];
    }
    acc[doc.documentNo].push(doc);
    return acc;
  }, {});

  // Paginate at the document level
  const startIndex = currentPage * rowsPerPage;
  const endIndex = startIndex + rowsPerPage;
  const paginatedGroups = Object.keys(groupedData).slice(startIndex, endIndex);

  // Flatten the paginated groups
  const paginatedData = paginatedGroups.flatMap((docNo) => groupedData[docNo]);

  // Process the data for timeline events
  const formattedData = paginatedData.map((doc) => {
    const { plannedSubmissionDate, dateIn, dateCompleted, submissionStatus, reviewStatus, stepOutcome, revision, documentNo } = doc;

    const revisionNumber = Number(revision);

    let validSubmissionStartDate = parseDate(plannedSubmissionDate) || new Date();
    let validSubmissionEndDate = parseDate(dateIn) || new Date();
    let validReviewStartDate = parseDate(dateIn) || new Date();
    let validReviewEndDate = parseDate(dateCompleted) || new Date();

    // Handle revisions: adjust submission dates accordingly
    if (revisionNumber === 0) {
      validSubmissionStartDate = parseDate(plannedSubmissionDate) || new Date();
      validSubmissionEndDate = parseDate(dateIn) || new Date();
    } else {
      validSubmissionStartDate = parseDate(dateIn) || new Date();
      validSubmissionEndDate = parseDate(dateIn) || new Date();
    }

    // Helper functions for date adjustments
    const startOfDay = (date) => {
      date.setHours(0, 0, 0, 0);
      return date;
    };
    const endOfDay = (date) => {
      date.setHours(23, 59, 59, 999);
      return date;
    };

    validSubmissionStartDate = startOfDay(validSubmissionStartDate);
    validSubmissionEndDate = endOfDay(validSubmissionEndDate);
    validReviewStartDate = startOfDay(validReviewStartDate);
    validReviewEndDate = endOfDay(validReviewEndDate);

    // Ensure submissionStart and submissionEnd are in order
    if (validSubmissionStartDate > validSubmissionEndDate) {
      validSubmissionStartDate = validSubmissionEndDate;
    }

    // Ensure reviewStart and reviewEnd are in order
    if (validReviewStartDate > validReviewEndDate) {
      validReviewStartDate = validReviewEndDate;
    }

    // Adjust submission and review to share the day, but ensure no overlap
    if (validSubmissionStartDate.getTime() === validSubmissionEndDate.getTime() && validReviewStartDate.getTime() === validReviewEndDate.getTime()) {
      const midOfDay = validSubmissionStartDate.getTime() + (12 * 60 * 60 * 1000); // 12 hours
      validSubmissionEndDate = new Date(midOfDay); // First half of the day
      validReviewStartDate = new Date(midOfDay); // Second half of the day
      validReviewEndDate = new Date(midOfDay + (12 * 60 * 60 * 1000)); // Ends 12 hours later
    } else {
      // Ensure that review starts after submission
      if (validReviewStartDate.getTime() <= validSubmissionEndDate.getTime()) {
        validReviewStartDate = new Date(validSubmissionEndDate.getTime() + 60 * 60 * 1000); // Start review after submission
      }
    }

    const submissionItem = {
      id: `${doc.documentNo}-submission-${revision}`,
      group: doc.documentNo,
      title: `Submission - ${submissionStatus} - rev ${revision} 
      \nStart: ${formatDate(validSubmissionStartDate)} 
      \nEnd: ${formatDate(validSubmissionEndDate)} 
      \nDuration: ${getDateDifference(validSubmissionStartDate, validSubmissionEndDate)} days (${getMonthDifference(validSubmissionStartDate, validSubmissionEndDate)} months)`,
      start_time: validSubmissionStartDate,
      end_time: validSubmissionEndDate,
      style: { backgroundColor: getStatusColor(submissionStatus) },
    };
    
    const reviewItem = validReviewStartDate && validReviewEndDate ? {
      id: `${doc.documentNo}-review-${revision}`,
      group: doc.documentNo,
      title: `Review - ${reviewStatus || stepOutcome} - rev ${revision} 
      \nStart: ${formatDate(validReviewStartDate)} 
      \nEnd: ${formatDate(validReviewEndDate)} 
      \nDuration: ${getDateDifference(validReviewStartDate, validReviewEndDate)} days (${getMonthDifference(validReviewStartDate, validReviewEndDate)} months)`,
      start_time: validReviewStartDate,
      end_time: validReviewEndDate,
      style: { backgroundColor: getStatusColor(reviewStatus || stepOutcome) },
    } : null;
    
    return [submissionItem, reviewItem].filter(Boolean);
  }).flat(); // Flatten the array of events

  // Generate groups from paginated data
  const groups = paginatedGroups.map((docNo) => {
    const doc = groupedData[docNo][0];
    const docTitle = doc ? doc.title.slice(0, 70) : "Unknown Title";
    const maxLength = 15;
    const shortenedTitle = docTitle.length > maxLength ? docTitle.slice(0, maxLength) + "..." : docTitle;

    return {
      id: docNo,
      title: shortenedTitle,
    };
  });

  // Post the result with only the visible groups and items
  postMessage({ items: formattedData, groups });
};
