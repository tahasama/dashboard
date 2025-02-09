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
  if (statusFilter && statusFilter !== "all") {
    const matchingDocuments = new Set(
      filteredData
        .filter(
          (item) =>
            item.reviewStatus === statusFilter || item.stepOutcome === statusFilter
        )
        .map((item) => item.documentNo) // Collect document numbers that match
    );
  
    // Keep all revisions of matching documents
    filteredData = filteredData.filter((item) =>
      matchingDocuments.has(item.documentNo)
    );
  }
  
  // Send filtered data back to the main thread
  self.postMessage(filteredData);
};
