const { MongoClient } = require("mongodb");
const createCsvWriter = require("csv-writer").createObjectCsvWriter;
require("dotenv").config();

// MongoDB Atlas URI and database details
const uri = process.env.MONGODB_URI;
const databaseName = process.env.DATABASE_NAME;

// List of collections to export
const collectionNames = ["jobapplications", "enquiryforms", "dealerdbs"]; // Add more collections here

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
