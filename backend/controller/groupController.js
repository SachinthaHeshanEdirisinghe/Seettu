const Group = require('../model/Group');
const User = require('../model/User');

const getMissingPhones = async (phones) => {
    const uniquePhones = [...new Set(
        phones
            .map((phone) => (typeof phone === 'string' ? phone.trim() : ''))
            .filter(Boolean)
    )];

    if (uniquePhones.length === 0) {
        return [];
    }

    const users = await User.find({ phone: { $in: uniquePhones } }).select('phone');
    const foundPhones = new Set(users.map((user) => user.phone));
    return uniquePhones.filter((phone) => !foundPhones.has(phone));
};

// CREATE
exports.createGroup = async (req, res) => {
    try {
        const { groupName, category, productName, totalPrice, installmentMonths, members, creatorEmail } = req.body;
        const email = typeof creatorEmail === 'string' ? creatorEmail.trim().toLowerCase() : '';

        if (!email) {
            return res.status(400).json({ message: 'Creator email is required.' });
        }

        const creator = await User.findOne({ email });
        if (!creator) {
            return res.status(404).json({ message: 'User not found. Please sign in again.' });
        }

        if (!Array.isArray(members) || members.length === 0) {
            return res.status(400).json({ message: 'Please add at least one group member.' });
        }

        const memberPhones = members.map((member) => member?.phone);
        const missingPhones = await getMissingPhones(memberPhones);
        if (missingPhones.length > 0) {
            return res.status(400).json({
                message: `These phone numbers are not registered: ${missingPhones.join(', ')}`,
            });
        }

        const newGroup = new Group({
            groupName,
            category,
            productName,
            totalPrice,
            installmentMonths,
            members,
            admin: email,
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
        const requesterEmail = typeof req.query.requesterEmail === 'string' ? req.query.requesterEmail.trim().toLowerCase() : '';
        const group = await Group.findById(req.params.id);
        
        if (!group) return res.status(404).json({ message: 'Group not found' });
        
        if (group.admin !== requesterEmail) {
            return res.status(403).json({ message: 'Only the group creator can delete this group.' });
        }
        
        await Group.findByIdAndDelete(req.params.id);
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

        const missingPhones = await getMissingPhones([trimmedPhone]);
        if (missingPhones.length > 0) {
            return res.status(400).json({
                message: 'This phone number is not registered. Ask them to sign up first.',
            });
        }

        const group = await Group.findById(req.params.id);
        if (!group) {
            return res.status(404).json({ message: 'Group not found' });
        }

        // For add-member flow, require requester to be the admin or a joined member.
        if (trimmedRequesterPhone || req.body.requesterEmail) {
            const requesterEmail = typeof req.body.requesterEmail === 'string' ? req.body.requesterEmail.trim().toLowerCase() : '';
            const isAdmin = group.admin === requesterEmail;
            
            const requesterJoined = Array.isArray(group.members)
                && group.members.some((member) => member.phone === trimmedRequesterPhone);
            
            if (!isAdmin && !requesterJoined) {
                return res.status(403).json({ message: 'Only the admin or group members can add members.' });
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

// REMOVE MEMBER FROM EXISTING GROUP
exports.removeMemberFromGroup = async (req, res) => {
    try {
        const { id, phone } = req.params;
        const requesterEmail = typeof req.query.requesterEmail === 'string' ? req.query.requesterEmail.trim().toLowerCase() : '';

        const group = await Group.findById(id);
        if (!group) {
            return res.status(404).json({ message: 'Group not found' });
        }

        const user = await User.findOne({ email: requesterEmail });
        
        const isSelfLeave = user && user.phone === phone;
        const isAdmin = group.admin === requesterEmail;

        if (!isAdmin && !isSelfLeave) {
            return res.status(403).json({ message: 'Not authorized to remove this member.' });
        }

        const initialLength = group.members.length;
        group.members = group.members.filter(member => member.phone !== phone);
        
        if (group.members.length === initialLength) {
            return res.status(404).json({ message: 'Member not found in group.' });
        }

        const updatedGroup = await group.save();
        res.status(200).json(updatedGroup);
    } catch (err) {
        res.status(500).json({ message: 'Failed to remove member', error: err.message });
    }
};

// REMOVE MULTIPLE MEMBERS FROM EXISTING GROUP
exports.removeMultipleMembersFromGroup = async (req, res) => {
    try {
        const { id } = req.params;
        const { phones, requesterEmail } = req.body;
        const email = typeof requesterEmail === 'string' ? requesterEmail.trim().toLowerCase() : '';

        if (!Array.isArray(phones) || phones.length === 0) {
            return res.status(400).json({ message: 'No phone numbers provided.' });
        }

        const group = await Group.findById(id);
        if (!group) {
            return res.status(404).json({ message: 'Group not found' });
        }

        if (group.admin !== email) {
            return res.status(403).json({ message: 'Only the group admin can remove members.' });
        }

        group.members = group.members.filter(member => !phones.includes(member.phone));
        const updatedGroup = await group.save();
        res.status(200).json(updatedGroup);
    } catch (err) {
        res.status(500).json({ message: 'Failed to remove members', error: err.message });
    }
};

// ADD MULTIPLE MEMBERS TO EXISTING GROUP
exports.addMultipleMembersToGroup = async (req, res) => {
    try {
        const { id } = req.params;
        const { members, requesterEmail } = req.body;
        const email = typeof requesterEmail === 'string' ? requesterEmail.trim().toLowerCase() : '';

        if (!Array.isArray(members) || members.length === 0) {
            return res.status(400).json({ message: 'No members provided.' });
        }

        const group = await Group.findById(id);
        if (!group) {
            return res.status(404).json({ message: 'Group not found' });
        }

        if (group.admin !== email) {
            return res.status(403).json({ message: 'Only the admin can bulk add members.' });
        }
        
        let validMembers = members;
        
        if (validMembers.length === 0) {
             return res.status(400).json({ message: 'None of the provided phone numbers are registered.' });
        }

        let addedCount = 0;
        for (const newMember of validMembers) {
             const trimmedName = typeof newMember.name === 'string' ? newMember.name.trim() : '';
             const trimmedPhone = typeof newMember.phone === 'string' ? newMember.phone.trim() : '';
             
             if (trimmedName && trimmedPhone) {
                 const alreadyJoined = group.members.some(member => member.phone === trimmedPhone);
                 if (!alreadyJoined) {
                     group.members.push({ name: trimmedName, phone: trimmedPhone });
                     addedCount++;
                 }
             }
        }
        
        if (addedCount === 0) {
            return res.status(400).json({ message: 'All users are already members or invalid.' });
        }

        const updatedGroup = await group.save();
        res.status(200).json({ group: updatedGroup, message: `Added ${addedCount} member(s).` });
    } catch (err) {
        res.status(500).json({ message: 'Failed to bulk add members', error: err.message });
    }
};