const mongoose = require("mongoose");
const initData = require("./data.js");
const Listing = require("../models/listing.js");
const axios = require("axios");
const NOMINATIM_URL = "https://nominatim.openstreetmap.org/search";


const MONGO_URL = "mongodb://127.0.0.1:27017/wanderlust";

main()
  .then(() => {
    console.log("connected to DB");
  })
  .catch((err) => {
    console.log(err);
  });

async function main() {
  await mongoose.connect(MONGO_URL);
}

const initDB = async () => {
  await Listing.deleteMany({}); 

  const newData = [];

  for (let obj of initData.data) {
    try {
      const response = await axios.get(NOMINATIM_URL, {
        params: {
          q: `${obj.location}, ${obj.country}`, 
          format: "json",
          limit: 1,
        },
        headers: {
          "User-Agent": "wanderlust-app",
        },
      });

      const geo = response.data[0];

      if (!geo) {
        console.log(`No geo found for ${obj.location}`);
        continue;
      }

      const newObj = {
        ...obj,
        owner: new mongoose.Types.ObjectId("69bc70ac6db0355477c5bda6"),
        geometry: {
          type: "Point",
          coordinates: [parseFloat(geo.lon), parseFloat(geo.lat)], 
        },
      };

      newData.push(newObj);

    } catch (err) {
      console.log("Error fetching geo:", err.message);
    }
  }

  await Listing.insertMany(newData);

  console.log("data initialized with map coordinates");
};

initDB();