
exports = function(){
  const orgid = context.values.get("orgid");
  
  const url = `https://cloud.mongodb.com/api/atlas/v1.0/orgs/${orgid}/invoices`;

  context.functions.execute("httpGetAtlas", url)
    .then(({ body }) => {
      const doc = JSON.parse(body.text());

      if (body.error) {
        console.error(`Error ${body}: '${body.detail}'`);
        return null;
      } else {
        
        const results = doc.results;
        const length = results.length;

        console.log("<<=== Full replacement mode ===>>");
        console.log("Totolly " + length + " invoices will by synced from Atlas to Bigquery");
            
        let tableName = getTableName();

        context.functions.execute("createBigqueryTable", tableName);
        
        //TODO For testing, to remove
        /*for (i = 28; i < 34; i++) {
           context.functions.execute("syncInvoiceCsvById", results[i].id, tableName);
        }*/
        
        for (i = 0; i < length; i++) {
           context.functions.execute("syncInvoiceCsvById", results[i].id, tableName);
        }
        
        //TODO Integrety check : calculate and print the total invoice items number, if numbers is the same as bigquery inserted rows, delete the previous month's table
        //Currently are the other tables are deleted.
        context.functions.execute("deleteBigQueryTablesExcept", tableName);
        
      }        
    })
    .catch(err => console.error(`Failed to insert billing doc: ${err}`));
};

function getTableName(){
  const gcpTable = context.values.get("gcpTable");
  
  todayDateString = new Date().getTime();
  
  const gcpTableName = gcpTable.concat("_",todayDateString);
  
  return gcpTableName;
}
