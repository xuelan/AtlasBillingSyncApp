exports = function(exceptTableName){
  
  try {
      context.functions.execute("getBigQueryTables")
      .then(function(result) {
      
      result.tables.forEach(x => {
        
        const tableName = x.tableReference.tableId;
        if(tableName != exceptTableName) {
          console.log("Deleting table: " + tableName);
          context.functions.execute("deleteBigQueryTableByName", tableName);
        } 
      });
    });
    
  } catch (err) {
    console.log("Error in deleteBigQueryTablesExcept(), error: " + err)
  }

};

