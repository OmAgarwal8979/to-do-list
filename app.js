//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
// const date = require(__dirname + "/date.js");
const mongoose = require("mongoose");
const _ = require("lodash");

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

mongoose.connect("mongodb+srv://omag1607:om-raghav@cluster0.tkfts.mongodb.net/todolistDB");

const itemsSchema = new mongoose.Schema({
  name: String
});

const Item = mongoose.model("item", itemsSchema);

const item1 = new Item ({
  name: "Welcome to your todolist!"
});

const item2 = new Item ({
  name: "Hit the + button to add a new item."
});

const item3 = new Item ({
  name: "<-- Hit this to delete an item."
});

const defaultItems = [item1, item2, item3];

const listSchema = {
  name: String,
  items: [itemsSchema]
};

const List = mongoose.model("list", listSchema);



app.get("/", function(req, res) {

// const day = date.getDate();

  Item.find({}, function(err, foundItems){
      if(err) throw err;
      else if(foundItems.length === 0) {
        Item.insertMany(defaultItems, function(err){
          if(err) throw err;
          console.log("Successfully saved default items to DB.");
        });
        res.redirect("/");
      }
      else {
        res.render("list", {listTitle: "Today", newListItems: foundItems});
      }
  });
});

app.post("/", function(req, res){

  const itemName = req.body.newItem;
  const listName = req.body.list;

  const item = new Item ({
    name: itemName
  });

  if(listName == "Today") {
    item.save();
    res.redirect("/");
  }
  else {
    List.findOne({name: listName}, function(err, foundList){
      foundList.items.push(item);
      foundList.save();
      res.redirect("/" + listName);
    });
  }
});

app.post("/delete", function(req, res){
  const checkedItemId = req.body.checkbox;
  const listName = req.body.listName;

  if(listName === "Today") {
    Item.findByIdAndRemove(checkedItemId, function(err){
      if(err) throw err;
      // console.log("Successfully Deleted");
      res.redirect("/");
    });
  }
  else {
    List.findOneAndUpdate({name: listName}, {$pull: {items: {_id: checkedItemId}}}, function(err, foundList){
      if(err) throw err;
      res.redirect("/"+ listName);
    });
  }
});

app.get("/:customListName", function(req, res){
    const customListName = _.capitalize(req.params.customListName);
    List.findOne({name: customListName}, function(err, foundList){
      if (err) throw err;
      else {
        if (!foundList) {
          //Create new List
          // console.log("Doesn't exist!");
          const list = new List({
            name: customListName,
            items: defaultItems
          });

          list.save();
          res.redirect("/" + customListName);
        }
        else {
          //Show existing list
          // console.log("Exists");
          res.render("list", {listTitle: foundList.name, newListItems: foundList.items});
        }
      }
    });
});

app.get("/about", function(req, res){
  res.render("about");
});

app.listen(3000, function() {
  console.log("Server started on port 3000");
});
