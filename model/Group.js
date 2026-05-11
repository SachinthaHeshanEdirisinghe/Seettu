const mongoose = require('mongoose');

const GroupSchema = new mongoose.Schema({
    groupName: { type: String, required: true },
    category: { type: String, required: true }, // e.g., Vehicle, Electronics
    productName: { type: String, required: true },
    totalPrice: { type: Number, required: true },
    installmentMonths: { type: Number, default: 10 },
    members: [{
        name: { type: String, required: true },
        paidStatus: { type: Boolean, default: false }
    }]
});

module.exports = mongoose.model('Group', GroupSchema);