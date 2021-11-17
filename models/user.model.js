const mongoose = require('mongoose');

var UserSchema = mongoose.Schema(
    {
        username : {
            type : String,
            required : true
        },

        password : {
            type : String,
            required : true
        },

        bookmarked : {
            type : Array,
            required : false
        },

        topics : {
            type : Array,
            required : false
        }
    }
);

module.exports = mongoose.model("userModel", UserSchema);