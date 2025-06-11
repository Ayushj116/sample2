import twilio from 'twilio';

const client = process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN 
  ? twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN)
  : null;

export const sendSMS = async ({ to, message }) => {
  try {
    if (process.env.NODE_ENV !== 'production' || !client) {
      console.log('SMS (Development Mode):', {
        to,
        message
      });
      return { success: true, messageId: 'dev-' + Date.now() };
    }

    const formattedPhone = to.startsWith('+91') ? to : `+91${to}`;

    const result = await client.messages.create({
      body: message,
      from: process.env.TWILIO_PHONE_NUMBER,
      to: formattedPhone
    });

    console.log('SMS sent successfully:', result.sid);
    return { success: true, messageId: result.sid };

  } catch (error) {
    console.error('SMS sending failed:', error);
    throw error;
  }
};

export const sendOTP = async ({ to, otp }) => {
  const message = `Your Safe Transfer verification code is: ${otp}. This code will expire in 10 minutes. Do not share this code with anyone.`;
  
  return sendSMS({ to, message });
};