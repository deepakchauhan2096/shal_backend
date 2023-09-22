const { default: mongoose } = require("mongoose");
require("dotenv").config();
console.log("CURRENT_SERVER_IP : ",process.env.CURRENT_SERVER_IP)
mongoose.set('strictQuery', false);
module.exports = mongoose
// .connect(`mongodb://verveuser:vervebot123@${process.env.CURRENT_SERVER_IP}/vervedb`, {
.connect(`mongodb://verveuser:vervebot123@127.0.0.1:27017/vervedb`, {
  useUnifiedTopology: true,
  useNewUrlParser: true
})
.then((res) => console.log("success connecting to mongo"))
.catch((err) => console.log(err));