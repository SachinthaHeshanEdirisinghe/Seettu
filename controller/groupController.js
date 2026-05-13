const Group = require('../model/Group');

// CREATE
exports.createGroup = async (req, res) => {
    try {
        const { groupName, category, productName, totalPrice, installmentMonths, members } = req.body;
        
        const newGroup = new Group({
            groupName,
            category,
            productName,
            totalPrice,
            installmentMonths,
            members 
        });
        const savedGroup = await newGroup.save();
        res.status(201).json(savedGroup);
    } catch (err) {
        res.status(500).json({ message: "Error while insert data", error: err.message });
    }
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

// ADD MEMBER TO EXISTING GROUP
exports.addMemberToGroup = async (req, res) => {
    try {
        const { name, phone, requesterPhone } = req.body;
        const trimmedName = typeof name === 'string' ? name.trim() : '';
        const trimmedPhone = typeof phone === 'string' ? phone.trim() : '';
        const trimmedRequesterPhone = typeof requesterPhone === 'string' ? requesterPhone.trim() : '';

        if (!trimmedName || !trimmedPhone) {
            return res.status(400).json({ message: 'Member name and phone are required.' });
        }

        const group = await Group.findById(req.params.id);
        if (!group) {
            return res.status(404).json({ message: 'Group not found' });
        }

        // For add-member flow, require requester to already be a joined member.
        if (trimmedRequesterPhone) {
            const requesterJoined = Array.isArray(group.members)
                && group.members.some((member) => member.phone === trimmedRequesterPhone);
            if (!requesterJoined) {
                return res.status(403).json({ message: 'Join the group before adding members.' });
            }
        }

        const alreadyJoined = Array.isArray(group.members)
            && group.members.some((member) => member.phone === trimmedPhone);
        if (alreadyJoined) {
            return res.status(409).json({ message: 'User already joined this group.' });
        }

        group.members.push({ name: trimmedName, phone: trimmedPhone });
        const updatedGroup = await group.save();

        res.status(200).json(updatedGroup);
    } catch (err) {
        res.status(500).json({ message: 'Failed to add member', error: err.message });
    }
};