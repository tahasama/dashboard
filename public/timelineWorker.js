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

   // Helper functions for date adjustments
   const startOfDay = (date) => {
    date.setHours(0, 0, 0, 0);
    return date;
  };
  const endOfDay = (date) => {
    date.setHours(23, 59, 59, 999);
    return date;
  };

  self.onmessage = function (event) {
    const { filtered, currentPage, rowsPerPage } = event.data;
  
    // Step 1: Group data by `documentNo` and `title`
    const groupedData = filtered.reduce((acc, doc) => {
      const uniqueKey = `${doc.documentNo}_${doc.title}`;
      if (!acc[uniqueKey]) {
        acc[uniqueKey] = [];
      }
      acc[uniqueKey].push(doc);
      return acc;
    }, {});
  
    // Step 2: Flatten all revisions into a single array
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
  
      // Initialize dates
      let validSubmissionStartDate, validSubmissionEndDate;
      let validReviewStartDate, validReviewEndDate;
  
      // Condition: Has plannedSubmissionDate but no dateIn/dateCompleted
      if (plannedSubmissionDate && !dateIn && !dateCompleted) {
        const parsedPlannedDate = parseDate(plannedSubmissionDate);
        const today = new Date();
  
        // CASE 1: Planned date is in the past
        if (parsedPlannedDate <= today) {
          validSubmissionStartDate = parsedPlannedDate;
          validSubmissionEndDate = today; // End at today
  
          // Review starts tomorrow and ends tomorrow + 1 hour
          validReviewStartDate = new Date(today);
          validReviewStartDate.setDate(today.getDate() + 1);
          validReviewEndDate = new Date(validReviewStartDate);
          validReviewEndDate.setHours(validReviewEndDate.getHours() + 1);
        } else {
          // CASE 2: Planned date is in the future
          validSubmissionStartDate = parsedPlannedDate;
          validSubmissionEndDate = parsedPlannedDate; // End at planned date
  
          // Review starts next day after planned date
          validReviewStartDate = new Date(parsedPlannedDate);
          validReviewStartDate.setDate(parsedPlannedDate.getDate() + 1);
          validReviewEndDate = new Date(validReviewStartDate);
          validReviewEndDate.setHours(validReviewEndDate.getHours() + 1);
        }
      } else {
        // CASE 3: Default logic when dateIn/dateCompleted exist
        if (revisionNumber === 0) {
          validSubmissionStartDate = parseDate(plannedSubmissionDate) || new Date();
          validSubmissionEndDate = parseDate(dateIn) || new Date();
        } else {
          validSubmissionStartDate = parseDate(dateIn) || new Date();
          validSubmissionEndDate = parseDate(dateIn) || new Date();
        }
  
        // Review dates
        validReviewStartDate = validSubmissionEndDate
          ? new Date(validSubmissionEndDate.getTime() + 24 * 60 * 60 * 1000)
          : new Date();
        validReviewEndDate = parseDate(dateCompleted) || new Date();
  
        // Ensure start <= end
        if (validSubmissionStartDate > validSubmissionEndDate) {
          validSubmissionStartDate = validSubmissionEndDate;
        }
        if (validReviewStartDate > validReviewEndDate) {
          validReviewStartDate = validReviewEndDate;
        }
      }
  
      // Add submission row
      rowSet.push({
        id: `${documentNo}-submission-${revision}`,
        group: documentNo,
        title: `Submission - ${submissionStatus} - rev ${revision} 
        \nStart: ${formatDate(validSubmissionStartDate)} 
        \nEnd: ${formatDate(validSubmissionEndDate)}`,
        start_time: validSubmissionStartDate,
        end_time: validSubmissionEndDate,
        style: { backgroundColor: getStatusColor(submissionStatus) },
      });
  
      // Add review row if dates are valid
      if (validReviewStartDate && validReviewEndDate) {
        rowSet.push({
          id: `${documentNo}-review-${revision}`,
          group: documentNo,
          title: `Review - ${reviewStatus || stepOutcome} - rev ${revision} 
          \nStart: ${formatDate(validReviewStartDate)} 
          \nEnd: ${formatDate(validReviewEndDate)}`,
          start_time: validReviewStartDate,
          end_time: validReviewEndDate,
          style: { backgroundColor: getStatusColor(reviewStatus || stepOutcome) },
        });
      }
  
      return rowSet.length > 0 ? rowSet : null;
    });
  
    // Step 4: Filter and flatten items
    const formattedData = paginatedData.filter(Boolean).flat();
  
    // Step 5: Generate groups
    const groups = [...new Set(formattedData.map((item) => item.group))].map((docNo) => ({
      id: docNo,
      title: docNo,
    }));
  
    // Step 6: Post result
    postMessage({ items: formattedData, groups });
  };
  
  
  




