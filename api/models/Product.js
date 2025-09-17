const mongoose = require('mongoose');

const ProductSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    description: String,
    price: {
        type: Number,
        required: true
    },
    images: [{
        type: String
    }],
    category: {
        type: String,
        required: true
    },
    isAvailable: {
        type: Boolean,
        default: true
    },
    sizes: [{
        type: String
    }],
    colors: [{
        type: String
    }]
}, { timestamps: true });

module.exports = mongoose.models.Product || mongoose.model('Product', ProductSchema);