const mongoose = require('mongoose');

const groupSchema = new mongoose.Schema({
    groupName: { type: String, required: true },
    category: {
        type: String,
        enum: ['Car', 'Phone', 'Bike', 'TV', 'Laptop', 'Audio', 'Tablet', 'Camera', 'Smartwatch', 'Appliance', 'Gaming'],
        required: true
    },
    productName: { type: String, required: true },
    totalPrice: { type: Number, required: true },
    installmentMonths: { type: Number, default: 10 },
    members: [
        {
            name: String,
            phone: String,
            joinedAt: { type: Date, default: Date.now }
        }
    ],
    admin: { type: String, required: true },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Group', groupSchema);