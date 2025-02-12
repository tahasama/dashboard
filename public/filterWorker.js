self.onmessage = (e) => {
  const { data, filters } = e.data;

  const {
    searchText,
    createdByFilter,
    subProjectFilter,
    disciplineFilter,
    statusFilter,
    subStatusFilter,
  } = filters;

  let filteredData = data;

  // Apply searchText filter
  if (searchText) {
    filteredData = filteredData.filter(
      (item) =>
        item.documentNo.includes(searchText) ||
        item.title.toLowerCase().includes(searchText.toLowerCase())
    );
  }

  // Apply other filters
  if (createdByFilter && createdByFilter !== "all") {
    filteredData = filteredData.filter(
      (item) => item.selectList5 === createdByFilter
    );
  }
  if (subProjectFilter && subProjectFilter !== "all") {
    filteredData = filteredData.filter(
      (item) => item.selectList3 === subProjectFilter
    );
  }
  if (subStatusFilter && subStatusFilter !== "all") {
    filteredData = filteredData.filter(
      (item) => item.submissionStatus === subStatusFilter)
  }
  if (disciplineFilter && disciplineFilter !== "all") {
    filteredData = filteredData.filter(
      (item) => item.selectList1 === disciplineFilter
    );
  }
  if (statusFilter && (statusFilter.review || statusFilter.submission)) {
    const matchingDocuments = new Set(
      filteredData
        .filter((item) => {
          const isReviewMatch = statusFilter.review && (item.reviewStatus === statusFilter.review || item.stepOutcome === statusFilter.review);
          const isSubmissionMatch = statusFilter.submission && item.submissionStatus === statusFilter.submission;
  
          // If both are selected, match only documents that satisfy BOTH
          if (statusFilter.review && statusFilter.submission) {
            return isReviewMatch && isSubmissionMatch;
          }
  
          // Otherwise, match documents satisfying at least one condition
          return isReviewMatch || isSubmissionMatch;
        })
        .map((item) => item.documentNo)
    );
  
    // Keep all revisions of matching documents
    filteredData = filteredData.filter((item) => matchingDocuments.has(item.documentNo));
  }
  
  
  
  // Send filtered data back to the main thread
  self.postMessage(filteredData);
};
