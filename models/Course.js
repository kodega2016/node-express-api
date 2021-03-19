const { Schema, model } = require("mongoose");

const courseScheme = new Schema({
  title: {
    type: String,
    trim: true,
    required: [true, "Please add a course title."],
  },
  description: {
    type: String,
    required: [true, "Please add a description."],
  },
  weeks: {
    type: String,
    required: [true, "Please add number of weeks."],
  },
  tuition: {
    type: Number,
    required: [true, "Please add tution cost."],
  },
  minimumSkill: {
    type: String,
    required: [true, "Please add minimum skill."],
    enum: ["beginner", "intermediate", "advanced"],
  },
  scholarshipAvailable: {
    type: Boolean,
    default: false,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  bootcamp: {
    type: Schema.Types.ObjectId,
    ref: "Bootcamp",
    required: true,
  },
  user: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
});

courseScheme.statics.getAverageCost = async function (bootcampId) {
  const obj = await this.aggregate([
    {
      $match: { bootcamp: bootcampId },
    },
    {
      $group: {
        _id: "$bootcamp",
        averageCost: { $avg: "$tuition" },
      },
    },
  ]);

  try {
    await this.model("Bootcamp").findByIdAndUpdate(bootcampId, {
      averageCost: Math.ceil(obj[0].averageCost / 10) * 10,
    });
  } catch (err) {
    console.error(err);
  }
};

// Call getAverageCost after save
courseScheme.post("save", function () {
  this.constructor.getAverageCost(this.bootcamp);
});

// Call getAverageCost before remove
courseScheme.pre("remove", function () {
  this.constructor.getAverageCost(this.bootcamp);
});
module.exports = model("Course", courseScheme);
