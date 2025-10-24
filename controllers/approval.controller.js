const db = require('../models');

const getPendingApprovals = async (req, res) => {
  try {
    const userRole = req.user.role;
    
    let allowedRoles = [];
    // Allow CEOs and Admins to see service_seller requests as well
    if (userRole === 'ceo') {
      // CEO can approve admins and service sellers
      allowedRoles = ['admin', 'service_seller'];
    } else if (userRole === 'admin') {
      // Admins can approve creators, IT support and service sellers
      allowedRoles = ['creator', 'it_support', 'service_seller'];
    } else {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }

    const approvals = await db.Approval.findAll({
      where: {
        requestedRole: allowedRoles,
        status: 'pending',
      },
      include: [{
        model: db.User,
        as: 'user',
        attributes: ['id', 'email', 'fullName', 'bio', 'avatar'],
      }],
      order: [['createdAt', 'DESC']],
    });

    res.json({ approvals });
  } catch (error) {
    console.error('Get pending approvals error:', error);
    res.status(500).json({ error: 'Failed to fetch approvals' });
  }
};

const approveUser = async (req, res) => {
  try {
    const { approvalId } = req.params;
    const { approved, reason } = req.body;
    
    const approval = await db.Approval.findByPk(approvalId, {
      include: [{ model: db.User, as: 'user' }],
    });

    if (!approval) {
      return res.status(404).json({ error: 'Approval request not found' });
    }

    const userRole = req.user.role;
    const requestedRole = approval.requestedRole;

    // Permission rules:
    // - CEO: can approve admins and service_seller requests
    // - Admin: can approve creators, IT support, and service_seller requests
    if (userRole === 'ceo' && !['admin', 'service_seller'].includes(requestedRole)) {
      return res.status(403).json({ error: 'CEO can only approve admins and service sellers' });
    }
    if (userRole === 'admin' && !['creator', 'it_support', 'service_seller'].includes(requestedRole)) {
      return res.status(403).json({ error: 'Admin can only approve creators, IT support, or service sellers' });
    }

    approval.status = approved ? 'approved' : 'rejected';
    approval.approvedBy = req.user.id;
    approval.approvalDate = new Date();
    approval.reason = reason;
    await approval.save();

    if (approved) {
      await db.User.update(
        { 
          isApproved: true,
          approvedBy: req.user.id,
        },
        { where: { id: approval.userId } }
      );
    }

    res.json({ 
      message: `User ${approved ? 'approved' : 'rejected'} successfully`,
      approval 
    });
  } catch (error) {
    console.error('Approve user error:', error);
    res.status(500).json({ error: 'Failed to process approval' });
  }
};

const getMyApprovalStatus = async (req, res) => {
  try {
    const approval = await db.Approval.findOne({
      where: {
        userId: req.user.id,
      },
      include: [{
        model: db.User,
        as: 'approver',
        attributes: ['fullName', 'email'],
      }],
      order: [['createdAt', 'DESC']],
    });

    res.json({ approval });
  } catch (error) {
    console.error('Get approval status error:', error);
    res.status(500).json({ error: 'Failed to get approval status' });
  }
};

module.exports = {
  getPendingApprovals,
  approveUser,
  getMyApprovalStatus,
};
