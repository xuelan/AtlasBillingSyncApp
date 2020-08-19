// Retrieve Atlas Invoices Items by Invoice ID in CSV, convert to JSON and send to Bigquery
exports = function(invoiceID, tableName){
  
  const orgid = context.values.get("orgid");
  const numCsvHeader = context.values.get("numCsvHeader");

  const url = `https://cloud.mongodb.com/api/atlas/v1.0/orgs/${orgid}/invoices/${invoiceID}`;
  
  return context.functions.execute("httpGetInvoiceCSV", url)
    .then(({ body }) => {
      
      if (body.error) {
        console.error(`Error ${body}: '${body.detail}'`);
        return null;
      } else {

        let arrayInvoiceDetails = body.text().split(/\r?\n/);
        arrayInvoiceDetails.splice(0, numCsvHeader-1);
        
        //Ajust Row names, Bigquery doesn't allow blank space, CSV header is available under CSV tab, in Atlas documentation: https://docs.atlas.mongodb.com/reference/api/organization-get-one-invoice/#response
        arrayInvoiceDetails.splice(0, 1, 'Date,Description,Note,Project,ProjectID,SKU,Region,Cluster,ReplicaSet,ConfigServer,Application,Unit,UnitPrice,Quantity,DiscountPercent,Amount');
        const arrayInvoiceDetailsText = arrayInvoiceDetails.join('\n');
        const json = context.functions.execute("csvToJson", arrayInvoiceDetailsText);
        const jsonObj = JSON.parse(json);
        const jsonsLength = jsonObj.length;
        
        //A maximum of 500 rows is recommended by GCP Bigquery, https://cloud.google.com/bigquery/quotas#tabledatalist_requests
        const chunk = 500;
        
        console.log("Syncing Invoice " + invoiceID + " ( " + jsonsLength + " items, " + chunk + " chunks)");

        syncJsonArrayByBatch(jsonObj, chunk, tableName);
        
        return jsonsLength
      }
    })
    .catch(err => console.error(`Failed to insert invoice details: ${err}`));
}

function syncJsonArrayByBatch(jsons, chunk, tableName){
  
  const jsonsLength = jsons.length;
  
  var tempArray = [];
  
  try {
    
    for (index = 0; index < jsonsLength; index += chunk) {
      jsonChunk = jsons.slice(index, index+chunk);
      tempArray.push(jsonChunk);
    }
  
    const tempArrayLength = tempArray.length;
    
    for (i = 0; i < tempArrayLength; i++) {
      sendJsonsToBigQuery(tempArray[i], tableName);
    }
  
  } catch (err) {
    console.log("sendJsonsToBigQuery() error: ", err)
  }
    
}

function sendJsonsToBigQuery(json, tableName){
  
  const lengthJson = json.length;
  let invoiceJsonBigQuery = {};
  let arryRows = [];
  
  try {
    
      for (let i = 0; i < lengthJson; i++) {
    
        let jsonBody = {};
        jsonBody.json = json[i];
        arryRows.push(jsonBody);
      }
      
      invoiceJsonBigQuery.rows = arryRows;
      
      result = context.functions.execute("sendInvoiceToBigQuery", invoiceJsonBigQuery, tableName);
      console.log(lengthJson + " invoice items synced");

      return result;
      
  } catch (err) {
    console.log("sendJsonsToBigQuery() error: ", err)
  }

}


