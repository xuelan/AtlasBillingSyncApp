exports = async function(invoiceJson, tableName) {
  
  const token = context.values.get("gcpToken");
  const gcpProject = context.values.get("gcpProject");
  const gcpDataset = context.values.get("gcpDataset");
  const gcpTable = tableName;
  let result;
  
  try {
      
      console.log("Sending invoices to BigQuery Table: " + gcpTable);
    
      const response = await context.http.post({
      url: `https://bigquery.googleapis.com/bigquery/v2/projects/${gcpProject}/datasets/${gcpDataset}/tables/${gcpTable}/insertAll`,
      headers: {"Content-Type": [ "application/json" ], "Accept": [ "application/json" ], "Authorization": [`Bearer ${token}`]},
      body: invoiceJson,
      encodeBodyAsJSON: true
    })
    
    // The response body is a BSON.Binary object. Parse it and return.
    result = JSON.parse(response.body.text());
  
  }  
  catch(err) {
    console.log("sendInvoiceToBigQiery() error: " + err);
  }

  return result;
};
