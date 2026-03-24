import twilio from "twilio";

const client = twilio(
  process.env.TWILIO_ACCOUNT_SID!,
  process.env.TWILIO_AUTH_TOKEN!
);

export async function sendWhatsAppAlert(
  to: string,
  message: string
): Promise<boolean> {
  try {
    console.log("📤 Sending WhatsApp to:", to);

    const response = await client.messages.create({
      from: process.env.TWILIO_WHATSAPP_NUMBER!, // must be whatsapp:+14155238886
      to: `whatsapp:${to}`,
      body: message,
    });

    console.log("✅ Twilio SID:", response.sid);

    return true;
  } catch (error: any) {
    console.error("❌ Twilio ERROR:", error.message);
    return false;
  }
}