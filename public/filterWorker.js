self.onmessage = (e) => {
    const { data, filters } = e.data;

    const {
      searchText,
      createdByFilter,
      subProjectFilter,
      disciplineFilter,
      statusFilter,
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
    if (disciplineFilter && disciplineFilter !== "all") {
      filteredData = filteredData.filter(
        (item) => item.selectList1 === disciplineFilter
      );
    }
    if (statusFilter && statusFilter !== "all") {
      filteredData = filteredData.filter((item) => item.reviewStatus === statusFilter);
      console.log("🚀 ~ filteredData:", filteredData)
    }
  
    // Send filtered data back to the main thread
    self.postMessage(filteredData);
  };
  