const express = require("express");
const app = express();
const mongoose = require("mongoose");
const Listing = require("./models/listing.js");
const path = require("path");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const wrapAsync = require("./utils/wrapAsync.js");
const ExpressError = require("./utils/ExpressError.js");

const mongo_url = "mongodb://127.0.0.1:27017/wanderlust";

main()
    .then(() => {
        console.log("connected to db");
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

app.get("/", (req, res) => {
    res.send("Hello World!");
});

// Index route
app.get(
    "/listings",
    wrapAsync(async (req, res) => {
        const alllistings = await Listing.find({});
        res.render("listings/index", { alllistings });
    })
);

// New listing route
app.get("/listings/new", (req, res) => {
    res.render("listings/new");
});

// Show route
app.get(
    "/listings/:id",
    wrapAsync(async (req, res) => {
        const { id } = req.params;
        const listing = await Listing.findById(id);
        if (!listing) {
            throw new ExpressError(404, "Listing not found");
        }
        res.render("listings/show", { listing });
    })
);

// Create route
app.post(
    "/listings",
    wrapAsync(async (req, res) => {
        if(req.body.listing){
            throw new ExpressError(404, "send valid data for listing");
        }
        const newListing = new Listing(req.body);
        await newListing.save();
        res.redirect("/listings");
    })
);

// Edit route
app.get(
    "/listings/:id/edit",
    wrapAsync(async (req, res) => {
        const { id } = req.params;
        const listing = await Listing.findById(id);
        if (!listing) {
            throw new ExpressError(404, "Listing not found");
        }
        res.render("listings/edit", { listing });
    })
);

// Update route
app.put(
    "/listings/:id",
    wrapAsync(async (req, res) => {
        const { id } = req.params;
        const listing = await Listing.findByIdAndUpdate(id, req.body, { new: true });
        if (!listing) {
            throw new ExpressError(404, "Listing not found");
        }
        res.redirect("/listings");
    })
);

// Delete route
app.delete(
    "/listings/:id",
    wrapAsync(async (req, res) => {
        const { id } = req.params;
        const listing = await Listing.findByIdAndDelete(id);
        if (!listing) {
            throw new ExpressError(404, "Listing not found");
        }
        res.redirect("/listings");
    })
);

// Error handling middleware for undefined routes
app.all("*", (req, res, next) => {
    next(new ExpressError(404, "Page not found"));
});

// General error handling 
app.use((err, req, res, next) => {
    const { status = 500, message = "Something went wrong" } = err;
    res.render("error");
    
});

app.listen(8080, () => {
    console.log("server is listening to port 8080");
});
