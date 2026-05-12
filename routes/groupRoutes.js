const express = require('express');
const router = express.Router();
const groupController = require('../controller/groupController');

router.post('/', groupController.createGroup);
router.get('/', groupController.getAllGroups);
router.delete('/:id', groupController.deleteGroup);

module.exports = router;