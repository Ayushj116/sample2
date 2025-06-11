import User from '../models/User.js';
import Deal from '../models/Deal.js';
import KYC from '../models/KYC.js';

export const getDashboardData = async (req, res) => {
  try {
    const [
      activeDealsCount,
      totalUsers,
      completedDealsCount,
      totalVolume
    ] = await Promise.all([
      Deal.countDocuments({ status: { $nin: ['completed', 'cancelled', 'refunded'] } }),
      User.countDocuments({ createdAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) } }),
      Deal.countDocuments({ status: 'completed' }),
      Deal.aggregate([
        { $match: { status: 'completed' } },
        { $group: { _id: null, total: { $sum: '$amount' } } }
      ])
    ]);

    const totalVolumeValue = totalVolume[0]?.total || 0;
    const successRate = activeDealsCount + completedDealsCount > 0 
      ? ((completedDealsCount / (activeDealsCount + completedDealsCount)) * 100).toFixed(1)
      : '0.0';

    const recentActivity = await Deal.find()
      .sort({ updatedAt: -1 })
      .limit(10)
      .populate('buyer seller', 'firstName lastName')
      .select('dealId title status updatedAt buyer seller');

    const activityList = recentActivity.map(deal => ({
      id: deal._id,
      action: `Deal ${deal.status}`,
      timestamp: deal.updatedAt,
      details: `${deal.title} - ${deal.dealId}`
    }));

    res.json({
      success: true,
      data: {
        stats: {
          activeDeals: activeDealsCount,
          totalVolume: `₹${(totalVolumeValue / 10000000).toFixed(1)}Cr`,
          newUsers: totalUsers,
          successRate: `${successRate}%`
        },
        recentActivity: activityList
      }
    });

  } catch (error) {
    console.error('Get dashboard data error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

export const getFlaggedDeals = async (req, res) => {
  try {
    const { page = 1, limit = 10, severity } = req.query;
    
    const query = { flagged: true };
    if (severity) {
      query.riskScore = severity === 'high' ? { $gte: 70 } : 
                      severity === 'medium' ? { $gte: 40, $lt: 70 } : 
                      { $lt: 40 };
    }

    const deals = await Deal.find(query)
      .populate('buyer seller', 'firstName lastName fullName')
      .sort({ flaggedAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Deal.countDocuments(query);

    const flaggedDeals = deals.map(deal => ({
      id: deal._id,
      dealId: deal.dealId,
      title: deal.title,
      amount: deal.amount,
      flag: deal.flagReason || 'high-value',
      severity: deal.riskScore >= 70 ? 'high' : deal.riskScore >= 40 ? 'medium' : 'low',
      buyer: deal.buyer.fullName,
      seller: deal.seller.fullName,
      flaggedAt: deal.flaggedAt || deal.createdAt
    }));

    res.json({
      success: true,
      data: {
        deals: flaggedDeals,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });

  } catch (error) {
    console.error('Get flagged deals error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

export const getKYCReviews = async (req, res) => {
  try {
    const { page = 1, limit = 10, status } = req.query;
    
    const query = status ? { status } : { status: { $in: ['pending', 'in_progress'] } };

    const kycReviews = await KYC.find(query)
      .populate('user', 'firstName lastName fullName')
      .sort({ 'verification.submittedAt': -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await KYC.countDocuments(query);

    const reviews = kycReviews.map(kyc => ({
      id: kyc._id,
      user: kyc.user.fullName,
      type: kyc.kycType,
      status: kyc.status,
      submittedAt: kyc.verification.submittedAt || kyc.createdAt,
      documents: Object.keys(kyc.documents).filter(key => kyc.documents[key]?.fileUrl)
    }));

    res.json({
      success: true,
      data: {
        reviews,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });

  } catch (error) {
    console.error('Get KYC reviews error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

export const reviewKYC = async (req, res) => {
  try {
    const { kycId } = req.params;
    const { action } = req.params;
    const { notes } = req.body;

    const kyc = await KYC.findById(kycId);
    if (!kyc) {
      return res.status(404).json({
        success: false,
        message: 'KYC record not found'
      });
    }

    if (action === 'approve') {
      kyc.status = 'approved';
      kyc.verification.approvedAt = new Date();
      kyc.verification.approvedBy = req.user.userId;
      kyc.verification.expiryDate = new Date(Date.now() + 2 * 365 * 24 * 60 * 60 * 1000);
      
      // Update user KYC status
      await User.findByIdAndUpdate(kyc.user, { kycStatus: 'approved' });
      
    } else if (action === 'reject') {
      kyc.status = 'rejected';
      kyc.verification.rejectedAt = new Date();
      kyc.verification.rejectedBy = req.user.userId;
      kyc.verification.rejectionNotes = notes;
      
      // Update user KYC status
      await User.findByIdAndUpdate(kyc.user, { kycStatus: 'rejected' });
    }

    kyc.verification.reviewedAt = new Date();
    kyc.verification.reviewedBy = req.user.userId;
    
    kyc.addAuditEntry(
      `KYC ${action}d by admin`,
      req.user.userId,
      notes || `KYC ${action}d`,
      req.ip
    );

    await kyc.save();

    res.json({
      success: true,
      message: `KYC ${action}d successfully`
    });

  } catch (error) {
    console.error('Review KYC error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

export const reviewDeal = async (req, res) => {
  try {
    const { dealId } = req.params;
    const { action } = req.params;
    const { notes } = req.body;

    const deal = await Deal.findById(dealId);
    if (!deal) {
      return res.status(404).json({
        success: false,
        message: 'Deal not found'
      });
    }

    if (action === 'approve') {
      deal.flagged = false;
      deal.flagReason = null;
      deal.flaggedBy = null;
      deal.flaggedAt = null;
      
    } else if (action === 'flag') {
      deal.flagged = true;
      deal.flagReason = notes || 'Admin review required';
      deal.flaggedBy = req.user.userId;
      deal.flaggedAt = new Date();
      
    } else if (action === 'investigate') {
      deal.flagged = true;
      deal.flagReason = 'Under investigation';
      deal.flaggedBy = req.user.userId;
      deal.flaggedAt = new Date();
    }

    await deal.save();

    res.json({
      success: true,
      message: `Deal ${action}d successfully`
    });

  } catch (error) {
    console.error('Review deal error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};