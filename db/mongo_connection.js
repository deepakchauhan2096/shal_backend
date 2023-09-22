const { default: mongoose } = require("mongoose");
require("dotenv").config();
console.log("CURRENT_SERVER_IP : ",process.env.CURRENT_SERVER_IP)
mongoose.set('strictQuery', false);
module.exports = mongoose
// .connect(`mongodb://verveuser:vervebot123@${process.env.CURRENT_SERVER_IP}/vervedb`, {
.connect(`mongodb+srv://deepakchauhan:12345@cluster0.zq3mlyy.mongodb.net/vervedb`, {
  useUnifiedTopology: true,
  useNewUrlParser: true
})
.then((res) => console.log("success connecting to mongo"))
.catch((err) => console.log(err));