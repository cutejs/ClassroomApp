// Routes
// =============================================================
var db = require("../models");

var express=require("express");
var router = express.Router();

//creating the home route
router.get("/",function(req,res){
  res.render("login");
});
//creating the user/api route
router.get("/api/users", function(req, res) {
    // Here we add an "include" property to our options in our findAll query
    // We set the value to an array of the models we want to include in a left outer join
    // In this case, just db.Post
    db.userTable.findAll({}).then(function(dbusers) {
      res.json(dbusers);
    });
});
//posting a new user into the api/users
router.post("/api/users", function(req, res) {
  db.userTable.create(req.body).then(function(dbusers) {
    res.json(dbusers);
  });
});

//Does user exist
router.get("/api/users/:username/:name",function(req,res){
  db.userTable.findOne({
    where:{
      name:req.params.name,
      username:req.params.username
    }
  }).then(function(dbuser){
    res.json(dbuser);
  });
});

module.exports=router;