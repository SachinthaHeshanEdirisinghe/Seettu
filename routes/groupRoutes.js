const express = require('express');
const router = express.Router();
const groupController = require('../controller/groupController');

router.post('/', groupController.createGroup);
router.post('/:id/members', groupController.addMemberToGroup);
router.post('/:id/members/bulk', groupController.addMultipleMembersToGroup);
router.get('/', groupController.getAllGroups);
router.delete('/:id', groupController.deleteGroup);
router.delete('/:id/members/:phone', groupController.removeMemberFromGroup);
router.delete('/:id/members', groupController.removeMultipleMembersFromGroup);

module.exports = router;