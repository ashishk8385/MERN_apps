//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

mongoose.connect("mongodb://0.0.0.0:27017/todolistDB", {useNewUrlParser: true});

const itemsSchema = new mongoose.Schema({
  name: String
});

const Item = mongoose.model("Item", itemsSchema);

const item1 = new Item({
    name: "Welcome to your todolist!"
});

const item2 = new Item({
  name: "Hit the + button to add a new item."
});

const item3 = new Item({
  name: "<-- Hit this to delete an item."
});

const defaultItems = [item1, item2, item3];

const listSchema = {
  name: String,
  items: [itemsSchema]
};

const List = mongoose.model("List", listSchema);

app.get("/", function(req, res) {

  Item.find({})
  .then(foundItems => {
    if (foundItems.length === 0) {
      return Item.insertMany(defaultItems);
    } else {
      return foundItems;
    }
  })
  .then(items => {
    if (items.length === 0) {
      console.log("Successfully saved default items to DB.");
    }
    res.render("list", { listTitle: "Today", newListItems: items });
  })
  .catch(err => {
    console.log(err);
    // Handle the error accordingly, e.g., render an error page
    res.render("error");
  });


  

  

});

app.get("/:customListName", function(req, res){
  const customListName = req.params.customListName;

  List.findOne({ name: customListName })
  .then(foundList => {
    if (foundList !== null) {
      res.render("list", {listTitle: foundList.name,newListItems: foundList.items});
    } else {
      const list = new List({
        name: customListName,
        items: defaultItems
      });
    
      list.save();
    }
  })
  .catch(err => {
    console.error("Error finding list:", err);

  });


 
});

app.post("/", function(req, res){

  const itemName = req.body.newItem;

  const item = new Item({
    name: itemName
  });

  item.save();

  res.redirect("/");
});

app.post("/delete", function(req,res){
  const checkedItemId = req.body.checkbox;

  Item.findByIdAndDelete(checkedItemId)
    .then(() => {
      console.log("Successfully deleted checked item.");
      res.redirect("/");
    })
    .catch((err) => {
      console.error("Error deleting item:", err);
    });

});

app.get("/work", function(req,res){
  res.render("list", {listTitle: "Work List", newListItems: workItems});
});

app.get("/about", function(req, res){
  res.render("about");
});

app.listen(3000, function() {
  console.log("Server started on port 3000");
});