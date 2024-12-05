const { MongoClient } = require('mongodb');
const createCsvWriter = require('csv-writer').createObjectCsvWriter;
require('dotenv').config();

// MongoDB Atlas URI and database details
const uri = process.env.MONGODB_URI;
const databaseName = process.env.DATABASE_NAME;
const collectionName = process.env.COLLECTION_NAME;

async function exportToCSV() {
  const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

  try {
    await client.connect();
    const database = client.db(databaseName);
    const collection = database.collection(collectionName);

    // Fetch all documents from the collection
    const cursor = collection.find({});
    const documents = await cursor.toArray();

    if (documents.length === 0) {
      console.log('No documents found in the collection.');
      return;
    }

    // Define the CSV writer
    const csvWriter = createCsvWriter({
      path: 'output.csv', // Path where the CSV will be saved
      header: Object.keys(documents[0]).map(key => ({ id: key, title: key })),
    });

    // Write the data to the CSV file
    await csvWriter.writeRecords(documents);
    console.log('Data successfully written to CSV file.');
  } catch (error) {
    console.error('Error exporting data to CSV:', error);
  } finally {
    await client.close();
  }
}

exportToCSV().catch(console.error);
