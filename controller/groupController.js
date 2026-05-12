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

// DELETE
exports.deleteGroup = async (req, res) => {
    try {
        const deleted = await Group.findByIdAndDelete(req.params.id);
        if (!deleted) return res.status(404).json({ message: 'Group not found' });
        res.status(200).json({ message: 'Group deleted', id: req.params.id });
    } catch (err) {
        res.status(500).json(err);
    }
};