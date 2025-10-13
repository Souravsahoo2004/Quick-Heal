// src/app/api/send-order-confirmation/route.ts
import { NextRequest, NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

export async function POST(request: NextRequest) {
  try {
    const orderData = await request.json();
    
    console.log('🚀 Sending order notification email...');
    console.log('Order ID:', orderData.orderNumber);
    console.log('Admin Email:', process.env.ADMIN_EMAIL);

    // Create Gmail SMTP transporter - FIXED: createTransport (not createTransporter)
    const transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 587,
      secure: false, // use STARTTLS
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_APP_PASSWORD,
      },
    });

    // Create beautiful HTML email
    const emailHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
            .container { max-width: 600px; margin: 0 auto; background: #f9f9f9; }
            .header { background: #2563eb; color: white; padding: 30px; text-align: center; }
            .content { padding: 30px; background: white; }
            .order-box { background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #2563eb; }
            .item-row { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #eee; }
            .total-box { background: #e8f5e8; padding: 15px; border-radius: 8px; font-weight: bold; font-size: 18px; text-align: center; }
            .address-box { background: #fff3cd; padding: 15px; border-radius: 8px; border: 1px solid #ffeaa7; }
            .urgent { background: #ff6b6b; color: white; padding: 10px; text-align: center; border-radius: 8px; margin: 20px 0; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🚨 NEW ORDER ALERT!</h1>
              <h2>QuickHealth Admin Dashboard</h2>
              <p>Order ${orderData.orderNumber} • ₹${orderData.total}</p>
            </div>
            
            <div class="content">
              <div class="urgent">
                <strong>⚡ IMMEDIATE ACTION REQUIRED</strong>
              </div>

              <div class="order-box">
                <h3>📋 Order Details</h3>
                <p><strong>Order ID:</strong> ${orderData.orderNumber}</p>
                <p><strong>Customer:</strong> ${orderData.customerName}</p>
                <p><strong>Phone:</strong> ${orderData.address?.phone}</p>
                <p><strong>Date:</strong> ${orderData.orderDate}</p>
                <p><strong>Expected Delivery:</strong> ${orderData.expectedDelivery}</p>
              </div>

              <div class="order-box">
                <h3>🛒 Items Ordered (${orderData.items?.length || 0} items)</h3>
                ${orderData.items?.map((item: any) => `
                  <div class="item-row">
                    <div>
                      <strong>${item.name}</strong><br>
                      <small>Qty: ${item.qty} × ₹${item.price}</small>
                    </div>
                    <div><strong>₹${item.price * item.qty}</strong></div>
                  </div>
                `).join('') || '<p>No items found</p>'}
              </div>

              <div class="total-box">
                💰 TOTAL: ₹${orderData.total} (COD)
              </div>

              <div class="address-box">
                <h3>📍 Delivery Address</h3>
                <p><strong>${orderData.address?.name}</strong></p>
                <p><strong>📞 ${orderData.address?.phone}</strong></p>
                <p>${orderData.address?.addressLine1}</p>
                ${orderData.address?.addressLine2 ? `<p>${orderData.address.addressLine2}</p>` : ''}
                <p>${orderData.address?.city}, ${orderData.address?.state} - ${orderData.address?.pincode}</p>
              </div>

              <div style="background: #d4edda; padding: 20px; border-radius: 8px; margin: 20px 0; border: 1px solid #c3e6cb;">
                <h3>✅ Next Steps:</h3>
                <ul>
                  <li>✓ Verify medicine availability</li>
                  <li>✓ Prepare order for dispatch</li>
                  <li>✓ Call customer: <strong>${orderData.address?.phone}</strong></li>
                  <li>✓ Update delivery status</li>
                </ul>
              </div>
            </div>
          </div>
        </body>
      </html>
    `;

    // Send email to admin
    const mailOptions = {
      from: `"QuickHealth Order System" <${process.env.GMAIL_USER}>`,
      to: process.env.ADMIN_EMAIL,
      subject: `🚨 NEW ORDER: ${orderData.orderNumber} - ₹${orderData.total} - ${orderData.customerName}`,
      html: emailHtml,
    };

    console.log('📧 Sending email to:', process.env.ADMIN_EMAIL);
    
    const info = await transporter.sendMail(mailOptions);

    console.log('✅ SUCCESS! Email sent to admin Gmail');
    console.log('Message ID:', info.messageId);

    return NextResponse.json({ 
      success: true, 
      message: 'Order notification sent to admin Gmail!',
      data: {
        messageId: info.messageId,
        adminEmail: process.env.ADMIN_EMAIL,
        orderNumber: orderData.orderNumber,
        timestamp: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('❌ EMAIL FAILED:', error);
    return NextResponse.json({ 
      error: 'Failed to send email to admin',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
