exports = function(csv){

  
  try {
    var lines=csv.split("\n");

    var result = [];
    
    var headers=lines[0].split(",");

    for(var i=1;i<lines.length;i++){
  
  	  var obj = {};
  	  var currentline=lines[i].split(",");
  
  	  for(var j=0;j<headers.length;j++){
  	    if(currentline[j] == ""){
          currentline[j] = null;
        }
  		  obj[headers[j]] = currentline[j];
  	  }
  
  	  result.push(obj);
  
    }
  }
  catch(err) {
    console.log("csvToJson() error: ", err)
  }

  return JSON.stringify(result); 
};
