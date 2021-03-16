const { Schema, model } = require("mongoose");
const slugify = require("slugify");
const geocoder = require("../utils/geocoder");

const bootCampSchema = new Schema({
  name: {
    type: String,
    required: [true, "Please add a name."],
    unique: true,
    trim: true,
    maxlength: [50, "Name cannot be mre than 50 characters."],
  },
  slug: String,
  description: {
    type: String,
    required: [true, "Please add a description."],
    maxlength: [500, "Description cannot be more than 500 characters."],
  },
  website: {
    type: String,
    match: [
      /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)/,
      "Please use a valid URL with HTTP or HTTPS",
    ],
  },
  phone: {
    type: String,
    maxlength: [20, "Phone number cannot be larger than 20 characters."],
  },
  email: {
    type: String,
    match: [
      /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
      "Please add a valid email address.",
    ],
  },
  address: {
    type: String,
    required: [false, "Please add an address."],
  },
  location: {
    type: {
      type: String,
      enum: ["Point"],
      required: false,
    },
    coordinates: {
      type: [Number],
      required: false,
      index: "2dsphere",
    },
    formattedAddress: String,
    street: String,
    city: String,
    state: String,
    zipcode: String,
    country: String,
  },
  careers: {
    type: [String],
    required: true,
    enum: [
      "Web Development",
      "Mobile Development",
      "UI/UX",
      "Data Science",
      "Business",
      "Other",
    ],
  },
  averageRating: {
    type: Number,
    min: [1, "Rating must be at least 1."],
    max: [10, "Rating must cannot be more than 10"],
  },
  averageCost: Number,
  photo: {
    type: String,
    default: "no-photo.png",
  },
  housing: {
    type: Boolean,
    default: false,
  },
  jobAssistance: {
    type: Boolean,
    default: false,
  },
  jobGuarantee: {
    type: Boolean,
    default: false,
  },
  acceptGi: {
    type: Boolean,
    default: false,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

bootCampSchema.pre("save", function (next) {
  this.slug = slugify(this.name);
  next();
});

bootCampSchema.pre("save", async function (next) {
  try {
    const loc = await geocoder.geocode(this.address);

    this.location = {
      type: "Point",
      coordinates: [loc[0].longitude, loc[0].latitude],
      formattedAddress: loc[0].formattedAddress,
      street: loc[0].streetName,
      city: loc[0].city,
      state: loc[0].state,
      zipcode: loc[0].zipcode,
      country: loc[0].country,
    };
    this.address = undefined;
  } catch (e) {
    console.log(e);
  }
  next();
});

module.exports = model("Bootcamp", bootCampSchema);
