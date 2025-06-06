import nodemailer from 'nodemailer';

// Create transporter
const createTransporter = () => {
  if (process.env.NODE_ENV === 'production') {
    // Production email configuration
    return nodemailer.createTransporter({
      service: 'gmail', // or your email service
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD
      }
    });
  } else {
    // Development - use Ethereal Email for testing
    return nodemailer.createTransporter({
      host: 'smtp.ethereal.email',
      port: 587,
      auth: {
        user: 'ethereal.user@ethereal.email',
        pass: 'ethereal.pass'
      }
    });
  }
};

// Email templates
const templates = {
  welcome: (data) => ({
    subject: 'Welcome to Safe Transfer - Your Secure Escrow Platform',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #2563eb, #1d4ed8); padding: 30px; text-align: center;">
          <h1 style="color: white; margin: 0;">Welcome to Safe Transfer</h1>
        </div>
        <div style="padding: 30px; background: #f9fafb;">
          <h2>Hello ${data.firstName}!</h2>
          <p>Welcome to Safe Transfer, India's most trusted escrow platform for secure high-value transactions.</p>
          
          <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3>Your Account Details:</h3>
            <p><strong>Account Type:</strong> ${data.userType === 'business' ? 'Business' : 'Personal'}</p>
            <p><strong>Next Steps:</strong></p>
            <ul>
              <li>Complete your KYC verification</li>
              <li>Add your bank account details</li>
              <li>Start your first secure transaction</li>
            </ul>
          </div>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${process.env.FRONTEND_URL}/dashboard" 
               style="background: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
              Go to Dashboard
            </a>
          </div>
          
          <p>If you have any questions, our support team is here to help at support@safetransfer.in</p>
          
          <p>Best regards,<br>The Safe Transfer Team</p>
        </div>
      </div>
    `
  }),

  deal_invitation: (data) => ({
    subject: `New Escrow Deal Invitation - ${data.dealId}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: #2563eb; padding: 20px; text-align: center;">
          <h1 style="color: white; margin: 0;">New Deal Invitation</h1>
        </div>
        <div style="padding: 30px; background: #f9fafb;">
          <h2>You've been invited to a secure escrow deal!</h2>
          
          <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3>Deal Details:</h3>
            <p><strong>Deal ID:</strong> ${data.dealId}</p>
            <p><strong>Title:</strong> ${data.title}</p>
            <p><strong>Amount:</strong> ₹${data.amount.toLocaleString()}</p>
            <p><strong>Your Role:</strong> ${data.role}</p>
            <p><strong>Invited by:</strong> ${data.initiatorName}</p>
          </div>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${data.dealLink}" 
               style="background: #16a34a; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
              View Deal Details
            </a>
          </div>
          
          <p>Please review the deal details and accept or decline the invitation.</p>
          
          <p>Best regards,<br>The Safe Transfer Team</p>
        </div>
      </div>
    `
  }),

  kyc_approved: (data) => ({
    subject: 'KYC Verification Approved - Safe Transfer',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: #16a34a; padding: 20px; text-align: center;">
          <h1 style="color: white; margin: 0;">KYC Approved ✓</h1>
        </div>
        <div style="padding: 30px; background: #f9fafb;">
          <h2>Congratulations ${data.firstName}!</h2>
          <p>Your KYC verification has been approved successfully.</p>
          
          <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3>What's Next:</h3>
            <ul>
              <li>You can now create and participate in escrow deals</li>
              <li>Higher transaction limits are now available</li>
              <li>Access to premium features</li>
            </ul>
          </div>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${process.env.FRONTEND_URL}/create-deal" 
               style="background: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
              Start Your First Deal
            </a>
          </div>
          
          <p>Best regards,<br>The Safe Transfer Team</p>
        </div>
      </div>
    `
  }),

  payment_received: (data) => ({
    subject: `Payment Received - ${data.dealId}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: #16a34a; padding: 20px; text-align: center;">
          <h1 style="color: white; margin: 0;">Payment Received</h1>
        </div>
        <div style="padding: 30px; background: #f9fafb;">
          <h2>Payment Successfully Deposited</h2>
          
          <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3>Transaction Details:</h3>
            <p><strong>Deal ID:</strong> ${data.dealId}</p>
            <p><strong>Amount:</strong> ₹${data.amount.toLocaleString()}</p>
            <p><strong>Transaction ID:</strong> ${data.transactionId}</p>
            <p><strong>Status:</strong> Funds Secured in Escrow</p>
          </div>
          
          <p>The funds are now securely held in escrow and will be released to the seller upon successful completion of the transaction.</p>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${data.dealLink}" 
               style="background: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
              View Deal Status
            </a>
          </div>
          
          <p>Best regards,<br>The Safe Transfer Team</p>
        </div>
      </div>
    `
  })
};

export const sendEmail = async ({ to, subject, template, data }) => {
  try {
    const transporter = createTransporter();
    
    let emailContent;
    if (template && templates[template]) {
      emailContent = templates[template](data);
      subject = emailContent.subject;
    } else {
      emailContent = { html: data.html || data.message };
    }

    const mailOptions = {
      from: process.env.EMAIL_FROM || 'Safe Transfer <noreply@safetransfer.in>',
      to,
      subject,
      html: emailContent.html
    };

    const result = await transporter.sendMail(mailOptions);
    console.log('Email sent successfully:', result.messageId);
    
    return result;
  } catch (error) {
    console.error('Email sending failed:', error);
    throw error;
  }
};