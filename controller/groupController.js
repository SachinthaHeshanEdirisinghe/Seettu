const Group = require('../model/Group');

// CREATE
exports.createGroup = async (req, res) => {
    try {
        const newGroup = new Group(req.body);
        const saved = await newGroup.save();
        res.status(201).json(saved);
    } catch (err) { res.status(500).json(err); }
};

// READ ALL
exports.getAllGroups = async (req, res) => {
    try {
        const groups = await Group.find();
        res.status(200).json(groups);
    } catch (err) { res.status(500).json(err); }
};