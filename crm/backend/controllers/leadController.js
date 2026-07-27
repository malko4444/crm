const Lead = require('../models/Lead');

const allowedStatuses = ['new', 'contacted', 'converted'];

const normalizeEmail = (email = '') => email.trim().toLowerCase();

const normalizeLeadPayload = (lead = {}) => ({
  name: lead.name?.trim(),
  email: normalizeEmail(lead.email),
  phone: lead.phone?.trim(),
  status: lead.status || 'new',
  assignedTo: lead.assignedTo?.trim()
});

const createLead = async (req, res, next) => {
  try {
    const { name, email, phone, status, assignedTo } = normalizeLeadPayload(req.body);

    if (status && !allowedStatuses.includes(status)) {
      res.status(400);
      throw new Error('Invalid lead status');
    }

    const duplicateLead = await Lead.findOne({ email });

    if (duplicateLead) {
      res.status(409);
      throw new Error('A lead with this email already exists');
    }

    const lead = await Lead.create({
      name,
      email,
      phone,
      status,
      assignedTo
    });

    res.status(201).json({
      success: true,
      lead
    });
  } catch (error) {
    next(error);
  }
};

const bulkCreateLeads = async (req, res, next) => {
  try {
    const incomingLeads = Array.isArray(req.body.leads) ? req.body.leads : [];

    if (!incomingLeads.length) {
      res.status(400);
      throw new Error('No leads were provided');
    }

    const normalizedLeads = incomingLeads.map(normalizeLeadPayload);
    const validLeads = [];
    const skipped = [];
    const seenEmails = new Set();

    normalizedLeads.forEach((lead, index) => {
      const rowNumber = index + 1;

      if (!lead.name || !lead.email) {
        skipped.push({ row: rowNumber, email: lead.email, reason: 'Name and email are required' });
        return;
      }

      if (!allowedStatuses.includes(lead.status)) {
        skipped.push({ row: rowNumber, email: lead.email, reason: 'Invalid lead status' });
        return;
      }

      if (seenEmails.has(lead.email)) {
        skipped.push({ row: rowNumber, email: lead.email, reason: 'Duplicate email in upload' });
        return;
      }

      seenEmails.add(lead.email);
      validLeads.push({ ...lead, row: rowNumber });
    });

    const existingEmails = validLeads.length
      ? await Lead.find({ email: { $in: validLeads.map((lead) => lead.email) } }).distinct('email')
      : [];
    const existingEmailSet = new Set(existingEmails);
    const leadsToCreate = [];

    validLeads.forEach(({ row, ...lead }) => {
      if (existingEmailSet.has(lead.email)) {
        skipped.push({ row, email: lead.email, reason: 'Lead already exists' });
        return;
      }

      leadsToCreate.push(lead);
    });

    const createdLeads = leadsToCreate.length ? await Lead.insertMany(leadsToCreate, { ordered: false }) : [];

    res.status(201).json({
      success: true,
      inserted: createdLeads.length,
      skipped,
      total: incomingLeads.length
    });
  } catch (error) {
    next(error);
  }
};

const getLeads = async (req, res, next) => {
  try {
    const page = Math.max(Number(req.params.page || req.query.page) || 1, 1);
    const limit = Math.min(Math.max(Number(req.query.limit) || 10, 1), 100);
    const skip = (page - 1) * limit;
    const { search, status } = req.query;

    const query = {};

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }

    if (status) {
      if (!allowedStatuses.includes(status)) {
        res.status(400);
        throw new Error('Invalid lead status');
      }

      query.status = status;
    }

    const [leads, totalLeads, statusSummary] = await Promise.all([
      Lead.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit),
      Lead.countDocuments(query),
      Lead.aggregate([
        { $match: query },
        { $group: { _id: '$status', count: { $sum: 1 } } }
      ])
    ]);

    const statusCounts = allowedStatuses.reduce(
      (counts, leadStatus) => ({
        ...counts,
        [leadStatus]: statusSummary.find((item) => item._id === leadStatus)?.count || 0
      }),
      {}
    );

    res.json({
      leads,
      totalLeads,
      totalPages: Math.ceil(totalLeads / limit),
      currentPage: page,
      statusCounts
    });
  } catch (error) {
    next(error);
  }
};

const updateLeadStatus = async (req, res, next) => {
  try {
    const { status } = req.body;

    if (!allowedStatuses.includes(status)) {
      res.status(400);
      throw new Error('Invalid lead status');
    }

    const lead = await Lead.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true, runValidators: true }
    );

    if (!lead) {
      res.status(404);
      throw new Error('Lead not found');
    }

    res.json({
      success: true,
      lead
    });
  } catch (error) {
    next(error);
  }
};

const deleteLead = async (req, res, next) => {
  try {
    const lead = await Lead.findByIdAndDelete(req.params.id);

    if (!lead) {
      res.status(404);
      throw new Error('Lead not found');
    }

    res.json({
      success: true,
      message: 'Lead deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createLead,
  bulkCreateLeads,
  getLeads,
  updateLeadStatus,
  deleteLead
};
