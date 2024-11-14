const fs = require('fs');

function writeJson(filePath, body) {
	fs.writeFile(filePath, JSON.stringify(body, null, 4), 'utf8', function (err) {
		if (err) {
			console.error('An error occured while writing in ' + filePath);
			console.error(err);
		} else {
			console.log('Succesfully write in ' + filePath);
		}
	});
}

function readJson(filePath) {
	return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

function reverseColumnsAndIndices(data) {
    // Deep clone the data to avoid mutations
    const newData = JSON.parse(JSON.stringify(data));
    
    // Reverse columns array
    newData.columns = newData.columns.reverse();
    
    // Helper function to flip the first index in a "from" pair
    function flipIndex(fromPair) {
      if (!fromPair) return null;
      
      // Handle array of pairs
      if (Array.isArray(fromPair[0])) {
        return fromPair.map(pair => [
          pair[0] === 0 ? 0 : -pair[0],
          pair[1]
        ]);
      }
      
      // Handle single pair
      return [
        fromPair[0] === 0 ? 0 : -fromPair[0],
        fromPair[1]
      ];
    }
    
    // Process each column and cell
    newData.columns.forEach(column => {
      column.forEach(cell => {
        if (cell && 'from' in cell) {
          cell.from = flipIndex(cell.from);
        }
      });
    });
    
    return newData;
  }
  
  // Read the file
  const filePath = `./public/json/lines/${process.argv[2]}.json`;
  
  // Load and process the data
  const data = readJson(filePath);
  const processedData = reverseColumnsAndIndices(data);
  
// Write back to file with proper formatting
writeJson(filePath, processedData);
