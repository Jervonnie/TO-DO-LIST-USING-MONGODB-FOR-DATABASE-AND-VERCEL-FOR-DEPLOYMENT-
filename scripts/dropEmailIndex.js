const mongoose = require('mongoose');
require('dotenv').config();

async function run() {
  try {
    await mongoose.connect(process.env.MONGO_URI, { dbName: 'test' }); // use DB name shown in error (test)
    console.log('Connected');
    const coll = mongoose.connection.collection('users');
    // if the index name is different, list indexes first: await coll.indexes()
    await coll.dropIndex('email_1');
    console.log('Dropped index email_1');
    await mongoose.disconnect();
  } catch (err) {
    console.error('Error:', err.message);
    process.exit(1);
  }
}

run();