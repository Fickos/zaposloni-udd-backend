// const { MongoClient } = require('mongodb');
const { DB_URI, DB_NAME } = require('../config');
// const client = new MongoClient(DB_URI);

// client.connect();
// const database = client.db(DB_NAME);

const mongoose = require('mongoose');

mongoose.connect(`${DB_URI}/${DB_NAME}`, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
.then(() => {
    console.log('Connected to MongoDB');
})
.catch((error) => {
    console.error('Error connecting to MongoDB:', error);
});


// async function save(coll, obj){
//     const created =  await database.collection(coll).insertOne(obj);
//     return {...created, ...obj};
// }

// async function getAll(coll){
//     return await database.collection(coll).find().toArray();
// }

// async function getOne(coll, id){
//     return await database.collection(coll).findOne(id);
// }

// async function update(coll, id, obj){
//     return await database.collection(coll).updateOne({_id: ObjectId(id)}, { $set: {...obj} });
// }

// async function deleteOne(coll, id){
//     return await database.collection(coll).deleteOne({_id: ObjectId(id)});
// }

// module.exports = { save, getAll, getOne, update, deleteOne };
