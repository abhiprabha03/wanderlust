const mongoose = require("mongoose");
const initdata = require("./data");
const Listing = require("../models/listing");

const mongo_url = "mongodb://127.0.0.1:27017/wanderlust";

main().then(() => {
    console.log("connected to db");
}).catch((err) => {
    console.log(err);
});

async function main() {
    await mongoose.connect(mongo_url);
}

const initDB = async () => {
    await Listing.deleteMany({});
    await Listing.insertMany(initdata.data.map((listing) => {
        if (typeof listing.image === "object" && listing.image.url) {
            listing.image = listing.image.url;
        }
        return listing;
    }));
    console.log("db seeded");
};
initDB();
