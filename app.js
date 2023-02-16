//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const _ = require("lodash");

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

mongoose.connect("mongodb+srv://amanverma04:Qwerty%40123456@cluster0.sfym8sq.mongodb.net/todolistDB", { useNewUrlParser: true }); // for making a connection with mongodb

// mongoose.set('strictQuery', True);

const itemsSchema = {
  name: String
};                              // for creating a schema

const Item = mongoose.model("Item", itemsSchema);  //creating model

const item1 = new Item({
  name: "Welcome to todolist"
});

const item2 = new Item({
  name: "Hit the + button to add new item"
});

const item3 = new Item({
  name: "hit -- to remove item"
});

const defaultItem = [item1, item2, item3];

const ListSchema = {

  name: String,
  items: [itemsSchema]
};

const List = mongoose.model("List", ListSchema);

app.get("/", function (req, res) {


  Item.find({}, function (err, foundItems) {

    if (foundItems.length === 0) {
      Item.insertMany(defaultItem, function (err) {                   //insert array into db 
        if (err) {
          console.log(err);
        } else {
          console.log("successfully saved defaultItem into DB...");
        }
      });
      res.redirect("/");
    } else {
      res.render("list", { listTitle: "Today", newListItems: foundItems });
    }

  });

});

app.post("/", function (req, res) {

  const itemName = req.body.newItem;
  const listName = req.body.list;

  const item = new Item({
    name: itemName
  });

  if (listName === "Today") {
    item.save();
    res.redirect("/");
  } else {

    List.findOne({ name: listName }, function (err, foundList) {

      foundList.items.push(item);
      foundList.save();
      res.redirect("/" + listName);

    });
  }
});

app.post("/delete", function (req, res) {

  const checkedItemId = req.body.checkbox;
  const listName = req.body.listName;

  if (listName === "Today") {

    Item.findByIdAndRemove(checkedItemId, function (err) {
      if (!err) {
        console.log("successfully deleted checked item..");
        res.redirect("/");
      }
    });

  } else {

    List.findOneAndUpdate({ name: listName }, { $pull: { items: { _id: checkedItemId } } }, function (err, foundList) {

      if (!err) {
        res.redirect("/" + listName);
      }
    });

  }

});

app.get("/:customListName", function (req, res) {

  const customListName = _.capitalize(req.params.customListName);

  List.findOne({ name: customListName }, function (err, foundList) {

    if (!err) {
      if (!foundList) {
        //create list
        const list = new List({
          name: customListName,
          items: defaultItem
        });
        list.save();
        res.redirect("/" + customListName);
      } else {
        //show lists

        res.render("list", { listTitle: foundList.name, newListItems: foundList.items });
      }
    }
  });


});

app.get("/about", function (req, res) {
  res.render("about");
});

app.listen(process.env.PORT || 3000, function () {
  console.log("Server started on port 3000");
});
