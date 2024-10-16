if(process.env.NODE_ENV !="production"){
  require("dotenv").config();
}


const express = require("express");
const app = express();
const mongoose = require("mongoose");
const path = require("path");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const ExpressError = require("./utils/ExpressError.js");
const session= require("express-session");
const MongoStore= require("connect-mongo");
const flash = require("connect-flash");
const passport = require("passport");
const LocalStrategy = require("passport-local");
const User = require("./models/user.js");

const ListingRouter = require("./routes/listing.js");
const reviewRouter = require("./routes/review.js");
const userRouter = require("./routes/user.js");

const mongo_url = "mongodb://127.0.0.1:27017/wanderlust";

main()
  .then(() => {
    console.log("connected to DB");
  })
  .catch((err) => {
    console.log(err);
  });

async function main() {
  await mongoose.connect(mongo_url);
}

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));
app.engine("ejs", ejsMate);
app.use(express.static(path.join(__dirname, "/public")));



const sessionOptions = {
  
  secret: process.env.SECRET,
  resave: false,
  saveUninitialized : true,
   cookie : {
    expires : Date.now() + 7 * 24 * 60 * 60 *1000,
    maxAge :  7 * 24 * 60 * 60 *1000,
    httpOnly : true,
   },
};






app.use(session(sessionOptions));
app.use(flash());

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

 



app.use((req , res , next)=>{
  res.locals.success = req.flash("success");
  res.locals.error = req.flash("error");
  res.locals.currUser=req.user;
  next();
});

// app.get("/demouser", async (req ,res )=>{
//   let fakeUser = new User({
//     email : "student@gmail.cpom",
//     username : "delta-student"
//   });
//  let registerdUser= await User.register(fakeUser , "helloworld");
//  res.send(registerdUser);

// })


app.use("/listings",ListingRouter);
app.use("/listings/:id/reviews",reviewRouter);
app.use("/",userRouter);



app.all("*", (req, res, next) => {
  next(new ExpressError(404, "page not Found !"))
})

app.use((err, req, res, next) => {

  let { statuscode = 500, message = "something went wrong !" } = err;

    // res.status(statuscode).send(message);
  res.status(statuscode).render("error.ejs", { message });
  next();

});

app.listen(8000, () => {
  console.log("server is listening to port 8000");
});
