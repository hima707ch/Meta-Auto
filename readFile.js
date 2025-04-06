const xlsx = require("xlsx");
const fs = require("fs");

function readExcelFile(filePath) {
    if (!fs.existsSync(filePath)) {
        throw new Error("File not found: " + filePath);
    }
    
    // Read the workbook
    const workbook = xlsx.readFile(filePath);
    
    // Get the first sheet name
    const sheetName = workbook.SheetNames[0];
    
    // Convert sheet to JSON
    const data = xlsx.utils.sheet_to_json(workbook.Sheets[sheetName]);
    
    return data; // Returns an array of objects
}

function getPostById(filePath, postId) {
    const data = readExcelFile(filePath);
    
    const row = data.find(row => {
        const rowId = row["Post ID"];
        if (typeof rowId === "string") {
            const numericId = rowId.replace(/\D/g, ""); // Extract numeric part
            console.log(numericId, postId)
            return numericId == postId;
        }
        return false;
    });
    
    if (!row) {
        throw new Error("Post ID not found: " + postId);
    }
    
    return {
        message: `
${row["Book Title"]}
${row["Book Description / Quote"]}
${row["Amazon/Bookshop Link"]}

${row["Teacher Quote"]}

${row["Fun Fact"] || row["Historical Context"]}

${row["Hashtags"]}
        `.trim(),
        imageUrl: row["Image URL"]
    };
}


function getPostArrayById(filePath, postId) {
    const data = readExcelFile(filePath);
    
    const row = data.find(row => {
        const rowId = row["Post ID"];
        if (typeof rowId === "string") {
            const numericId = rowId.replace(/\D/g, ""); // Extract numeric part
            console.log(numericId, postId)
            return numericId == postId;
        }
        return false;
    });
    
    if (!row) {
        throw new Error("Post ID not found: " + postId);
    }
    
    return [
        postId,
row["Book Title"],
row["Book Description / Quote"],
row["Amazon/Bookshop Link"],

row["Teacher Quote"],

row["Fun Fact"] || row["Historical Context"],

row["Hashtags"],
       
row["Image URL"]
    ]
}


function getNumberOfRows(filePath) {
    const data = readExcelFile(filePath);
    return data.length;
}

module.exports = { readExcelFile, getPostById, getNumberOfRows, getPostArrayById };
