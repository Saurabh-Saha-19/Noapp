const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const cors = require("cors");
const multer = require("multer");
const csv = require("csvtojson");

const app = express();
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cors());

mongoose.set("strictQuery", false);
mongoose.connect("mongodb://127.0.0.1/contactsDB", {
  useNewUrlParser: true,
});

const contactSchema = {
  name: String,
  phone: Number,
  email: String,
  url: String,
};

const ContactModel = mongoose.model("Contact", contactSchema);

const upload = multer({ dest: "uploads/" });

app.get("/", (req, res) => {
  ContactModel.find({}, (err, items) => {
    if (err) {
      console.log(err);
    } else {
      res.json({ items: items });
    }
  });
});

app.post("/", upload.single("file"), (req, res, next) => {
  const jsonArray = csv().fromFile(req.file.path);
  jsonArray.then((jsonObj) => {
    var contacts = [];
    for (var i = 0; i < jsonObj.length; i++) {
      var obj = {};
      obj.name = jsonObj[i]["Name"];
      obj.phone = jsonObj[i]["Phone"];
      obj.email = jsonObj[i]["Email"];
      obj.url = jsonObj[i]["Url"];
      contacts.push(obj);
    }
    ContactModel.insertMany(contacts, (err) => {
      if (err) {
        console.log(err);
      } else {
        console.log("Successfully saved");
      }
    });
  });
});

app.listen("3000", (err) => {
  if (!err) {
    console.log("Server is running at port 3000.");
  }
});
