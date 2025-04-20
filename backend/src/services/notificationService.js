import twilio from 'twilio';
const client = twilio(process.env.TWILIO_SID, process.env.TWILIO_AUTH_TOKEN);
const fromNumber = process.env.TWILIO_PHONE;

export const sendSMS = async (to, message) => {
  try {
    await client.messages.create({
      body: message,
      from: fromNumber,
      to: `+91${to}`
    });
    return true;
  } catch (err) {
    console.error('❌ SMS failed:', err.message);
    return false;
  }
};
