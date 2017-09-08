var mongoose = require("mongoose");

var ticketShema = new mongoose.Schema({
    title: String,
    description: String,
    priority: String,
    state: String,
    created: {type: Date, default: Date.now}
});

var Ticket = mongoose.model("Ticket", ticketShema);

module.exports = Ticket;