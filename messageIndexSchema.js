const mongoose = require ("mongoose");

const staticDataSchema = new mongoose.Schema({
    name: {
        type: String,
    },
    messageIndex : {
        type : Number,
    }

});

const StaticData = mongoose.model("staticData",staticDataSchema);

module.exports = StaticData;