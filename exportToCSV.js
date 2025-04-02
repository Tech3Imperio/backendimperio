const { MongoClient } = require("mongodb");
const createCsvWriter = require("csv-writer").createObjectCsvWriter;
require("dotenv").config();

// MongoDB Atlas URI and database details
const uri = process.env.MONGODB_URI;
const databaseName = process.env.DATABASE_NAME;

// List of collections to export
const collectionNames = ["jobapplications", "enquiryforms"]; // Add more collections here

async function exportToCSV(collectionName) {
  const client = new MongoClient(uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });

  try {
    await client.connect();
    const database = client.db(databaseName);
    const collection = database.collection(collectionName);

    // Fetch all documents from the collection
    const cursor = collection.find({});
    const documents = await cursor.toArray();

    if (documents.length === 0) {
      console.log(`No documents found in the ${collectionName} collection.`);
      return;
    }

    // Define the CSV writer
    const csvWriter = createCsvWriter({
      path: `${collectionName}_output.csv`, // Path where the CSV will be saved
      header: Object.keys(documents[0]).map((key) => ({ id: key, title: key })),
    });

    // Write the data to the CSV file
    await csvWriter.writeRecords(documents);
    console.log(`Data successfully written to ${collectionName}_output.csv`);

    return `${collectionName}_output.csv`; // Return the file name to be used in email attachment
  } catch (error) {
    console.error(`Error exporting data from ${collectionName}:`, error);
  } finally {
    await client.close();
  }
}

async function main() {
  const filePaths = [];
  for (const collectionName of collectionNames) {
    const filePath = await exportToCSV(collectionName);
    if (filePath) {
      filePaths.push(filePath); // Collect the file paths
    }
  }

  if (filePaths.length > 0) {
    // Call the sendEmail function with the list of generated CSV files
    require("./sendEmail")(filePaths); // You will implement the sendEmail function
  }
}

main().catch(console.error);

// const { MongoClient } = require("mongodb");
// const { google } = require("googleapis");
// const { OAuth2 } = require("google-auth-library");
// require("dotenv").config();
// const fs = require("fs");

// // MongoDB Atlas URI and database details
// const uri = process.env.MONGODB_URI;
// const databaseName = process.env.DATABASE_NAME;

// // List of collections to export
// const collectionNames = ["jobapplications", "enquiryforms"]; // Add more collections here

// // Google Sheets API setup
// const SCOPES = ["https://www.googleapis.com/auth/spreadsheets"];
// const credentials = require("./credentials.json"); // Path to your credentials.json
// const sheetId = "1G65CBiS70pdV3ZZbYwxyksao_KeMsEx-ogDpV1PRFX0"; // The ID of your Google Sheet

// // Authorize the client
// async function authorize() {
//   const { client_id, client_secret, redirect_uris } = credentials.installed;
//   const oauth2Client = new OAuth2(client_id, client_secret, redirect_uris[0]);

//   // Check for token
//   const tokenPath = "token.json";
//   if (fs.existsSync(tokenPath)) {
//     const token = JSON.parse(fs.readFileSync(tokenPath));
//     oauth2Client.setCredentials(token);
//     return oauth2Client;
//   }

//   // If no token exists, generate a new one
//   const authUrl = oauth2Client.generateAuthUrl({
//     access_type: "offline",
//     scope: SCOPES,
//   });
//   console.log("Authorize this app by visiting this URL:", authUrl);

//   const code = await promptForCode(); // Implement this function to get code from the user
//   const { tokens } = await oauth2Client.getToken(code);
//   oauth2Client.setCredentials(tokens);
//   fs.writeFileSync(tokenPath, JSON.stringify(tokens)); // Save the token for future use
//   return oauth2Client;
// }

// // Function to export data from MongoDB to Google Sheets
// async function exportToGoogleSheets(collectionName, oauth2Client) {
//   const sheets = google.sheets({ version: "v4", auth: oauth2Client });
//   const client = new MongoClient(uri, {
//     useNewUrlParser: true,
//     useUnifiedTopology: true,
//   });

//   try {
//     await client.connect();
//     const database = client.db(databaseName);
//     const collection = database.collection(collectionName);

//     // Fetch all documents from the collection
//     const cursor = collection.find({});
//     const documents = await cursor.toArray();

//     if (documents.length === 0) {
//       console.log(`No documents found in the ${collectionName} collection.`);
//       return;
//     }

//     // Prepare data for Google Sheets
//     const sheetData = documents.map((doc) => Object.values(doc)); // Convert each document to an array of values
//     const headers = Object.keys(documents[0]); // Use the first document's keys as headers

//     // Add headers to the sheet (start from row 1)
//     await sheets.spreadsheets.values.update({
//       spreadsheetId: sheetId,
//       range: "A1", // Start from the first cell
//       valueInputOption: "RAW",
//       requestBody: {
//         values: [headers, ...sheetData], // Write the headers and data
//       },
//     });

//     console.log(`Data successfully written to Google Sheets: ${sheetId}`);
//   } catch (error) {
//     console.error(`Error exporting data from ${collectionName}:`, error);
//   } finally {
//     await client.close();
//   }
// }

// // Main function to handle data export
// async function main() {
//   const oauth2Client = await authorize();

//   for (const collectionName of collectionNames) {
//     await exportToGoogleSheets(collectionName, oauth2Client);
//   }
// }

// main().catch(console.error);
