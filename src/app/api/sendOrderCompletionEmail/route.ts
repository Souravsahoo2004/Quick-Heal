// /src/app/api/sendOrderCompletionEmail/route.ts
import { NextRequest, NextResponse } from "next/server";
import nodemailer from "nodemailer";

export async function POST(request: NextRequest) {
  const { to, orderId, productName, sellerEmail } = await request.json();

  let transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: sellerEmail,
      pass: process.env.SMTP_PASS,
    },
  });

  await transporter.sendMail({
    from: sellerEmail,
    to,
    subject: "Your Order is Completed!",
    text: `Dear Customer, 

Your order for ${productName} has been  completed.

Thank you for shopping with us!`,
  });

  return NextResponse.json({ ok: true });
}
