var express = require("express");
var http = require("http");
var path = require("path");
var urlencoded = require("url");
var bodyParser = require("body-parser");
var json = require("json");
var logger = require("logger");
var methodOverride = require("method-override");

var nano = require("nano")("http://localhost:5984");

var db = nano.use("address");
var app = express();

app.set("port", process.env.PORT || 3000);
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "jade");

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));
app.use(methodOverride());
app.use(express.static(path.join(__dirname, 'public')));

app.get("/", function(req, res){
    res.render("index");
});

app.post("/createdb", function(req, res){
    nano.db.create(req.body.dbname, function(err){
        if(err){
            res.send("Error creating database " + req.body.dbname);
            console.log(err);
            return;
        }

        res.send("Database " + req.body.dbname + " created successfully");
    });
});

app.post("/new_contact", function(req, res){
        db.insert({name: req.body.name, phone: req.body.phone, crazy: true}, req.body.phone, function(err, body, header){
            if(err){
                res.send("Error creating contact");
                console.log(err);
                return;
            }

            res.send("Contact created successfully");
        });
});

app.post("/view_contact", function(req, res){
    var alldoc = "Following are the contacts:<br>";
    db.get(req.body.phone, { revs_info : true}, function(err, result){
        if(err){
            console.log(err);
        }

        if(result){
            alldoc += "Name: " + result.name + "<br/>Phone Number: " + result.phone;
        }
        else{
            alldoc = "No records found";
        }

        res.send(alldoc);
    });
});

app.post("/delete_contact", function(req, res){
    db.get(req.body.phone, {revs_info : true}, function(error, body){
       if(!error){
           db.destroy(req.body.phone, body._rev, function(err, body){
                if(err){
                    res.send("Error deleting contact");
                    return;
                }
           });           

           res.send("Contacts deleted successfully");
       } 
    });
});

http.Server(app).listen(app.get("port"), function(){
    console.log("Express server listening on port" + app.get("port"));
});