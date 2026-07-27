const express = require('express');
const {
  bulkCreateLeads,
  createLead,
  getLeads,
  updateLeadStatus,
  deleteLead
} = require('../controllers/leadController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.use(protect);

router.post('/bulk', bulkCreateLeads);
router.get('/page/:page', getLeads);
router.route('/').post(createLead).get(getLeads);
router.patch('/:id/status', updateLeadStatus);
router.delete('/:id', deleteLead);

module.exports = router;
