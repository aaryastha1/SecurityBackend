// const mongoose = require('mongoose');
// const dotenv = require('dotenv');

// dotenv.config();

// mongoose.connect(process.env.MONGODB_URI, {
//   useNewUrlParser: true,
//   useUnifiedTopology: true,
// })
//   .then(() => console.log('MongoDB connected'))
//   .catch((err) => console.error('MongoDB connection error:', err));

// module.exports = mongoose.connection;


const mongoose = require("mongoose")

const CONNECTION_STRING = process.env.MONGODB_URI
console.log(process.env)
const connectDB = async () => {
    try{
        await mongoose.connect(
            CONNECTION_STRING,
            {
                useNewUrlParser: true,
                useUnifiedTopology: true
            }
        )
    }catch(err){
        console.log("DB Err" , err)
    }
}
module.exports = connectDB