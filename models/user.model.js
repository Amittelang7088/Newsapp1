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
        }
    }
);

module.exports = mongoose.model("userModel", UserSchema);