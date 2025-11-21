const mongoose = require("mongoose");

const airbnbSchema = mongoose.Schema(
  {
    id: String,
    NAME: String,
    host_identity_verified: String,
    neighbourhood: String,
    lat: String,
    long: String,
    country: String,
    instant_bookable: String,
    cancellation_policy: String,
    price: String,
    house_rules: String,
    license: String,
    property_type: String,
    thumbnail: String,
    images: [String],
    hostId: String,
    hostName: String,
    neighbourhoodGroup: String,
    serviceFee: String,
    roomType: String,
    constructionYear: String,
    minimumNights: String,
    numberOfReviews: String,
    reviewsPerMonth: String,
    reviewRateNumber: String,
    calculatedHostListingsCount: String,
    availability365: String,
    lastReview: String,
    countryCode: String,
  },
  {
    collection: "airbnb",
  }
);

module.exports = mongoose.model("Airbnb", airbnbSchema);
