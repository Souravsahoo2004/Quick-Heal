// src/app/api/send-order-confirmation/route.ts
import { NextRequest, NextResponse } from 'next/server';
import nodemailer from 'nodemailer';
import { render } from '@react-email/components';
import OrderConfirmationEmail from '@/emails/OrderConfirmationEmail';

export async function POST(request: NextRequest) {
  try {
    const orderData = await request.json();
    
    console.log('🚀 Sending order notification emails...');
    console.log('Order ID:', orderData.orderNumber);
    console.log('Customer Email:', orderData.customerEmail);
    console.log('Admin Email:', process.env.ADMIN_EMAIL);

    // Create Gmail SMTP transporter
    const transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 587,
      secure: false, // use STARTTLS
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_APP_PASSWORD,
      },
    });

    // Verify transporter
    await transporter.verify();
    console.log('✅ SMTP connection verified');

    // ========================================
    // 1. SEND CUSTOMER CONFIRMATION EMAIL
    // ========================================
    console.log('📧 Rendering customer email template...');
    
    // ✅ FIX: Await the render function to get string
    const customerEmailHtml = await render(
      OrderConfirmationEmail({
        orderNumber: orderData.orderNumber,
        customerName: orderData.customerName,
        orderDate: orderData.orderDate,
        items: orderData.items,
        address: orderData.address,
        subtotal: orderData.subtotal,
        delivery: orderData.delivery,
        total: orderData.total,
        expectedDelivery: orderData.expectedDelivery,
      })
    );

    const customerMailOptions = {
      from: `"QuickHealth Store" <${process.env.GMAIL_USER}>`,
      to: orderData.customerEmail,
      subject: `Order Confirmation ${orderData.orderNumber} 🎉`,
      html: customerEmailHtml, // ✅ Now it's a string
    };

    console.log('📧 Sending email to customer:', orderData.customerEmail);
    
    // ✅ FIX: Properly await and handle the promise
    const customerInfo = await transporter.sendMail(customerMailOptions);
    console.log('✅ Customer email sent! Message ID:', customerInfo.messageId);

    // ========================================
    // 2. SEND ADMIN NOTIFICATION EMAIL
    // ========================================
    const adminEmailHtml = `
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
            .total-box { background: #10b981; color: white; padding: 15px; border-radius: 8px; font-weight: bold; font-size: 20px; text-align: center; margin: 20px 0; }
            .address-box { background: #fff3cd; padding: 15px; border-radius: 8px; border: 1px solid #ffeaa7; }
            .urgent { background: #ff6b6b; color: white; padding: 15px; text-align: center; border-radius: 8px; margin: 20px 0; font-size: 18px; }
            .action-box { background: #d4edda; padding: 20px; border-radius: 8px; margin: 20px 0; border: 1px solid #c3e6cb; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🚨 NEW ORDER ALERT!</h1>
              <h2>QuickHealth Admin Dashboard</h2>
              <p>Order ${orderData.orderNumber}</p>
            </div>
            
            <div class="content">
              <div class="urgent">
                <strong>⚡ IMMEDIATE ACTION REQUIRED</strong>
              </div>

              <div class="order-box">
                <h3>📋 Order Details</h3>
                <p><strong>Order ID:</strong> ${orderData.orderNumber}</p>
                <p><strong>Customer:</strong> ${orderData.customerName}</p>
                <p><strong>Customer Email:</strong> ${orderData.customerEmail}</p>
                <p><strong>Phone:</strong> ${orderData.address?.phone || 'N/A'}</p>
                <p><strong>Order Date:</strong> ${orderData.orderDate}</p>
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
                💰 TOTAL AMOUNT: ₹${orderData.total}
                <div style="font-size: 14px; margin-top: 5px; font-weight: normal;">
                  Subtotal: ₹${orderData.subtotal} + Delivery: ₹${orderData.delivery}
                </div>
              </div>

              <div class="address-box">
                <h3>📍 Delivery Address</h3>
                <p><strong>${orderData.address?.name}</strong></p>
                <p><strong>📞 ${orderData.address?.phone}</strong></p>
                <p>${orderData.address?.addressLine1}</p>
                ${orderData.address?.addressLine2 ? `<p>${orderData.address.addressLine2}</p>` : ''}
                <p>${orderData.address?.city}, ${orderData.address?.state} - ${orderData.address?.pincode}</p>
              </div>

              <div class="action-box">
                <h3>✅ Next Steps:</h3>
                <ul>
                  <li>✓ Verify medicine availability</li>
                  <li>✓ Prepare order for dispatch</li>
                  <li>✓ Call customer: <strong>${orderData.address?.phone}</strong></li>
                  <li>✓ Update delivery status in admin dashboard</li>
                  <li>✓ Arrange courier pickup</li>
                </ul>
              </div>

              <div style="background: #e3f2fd; padding: 15px; border-radius: 8px; text-align: center;">
                <p style="margin: 0; font-size: 14px; color: #1976d2;">
                  📧 Customer confirmation email sent to: <strong>${orderData.customerEmail}</strong>
                </p>
              </div>
            </div>
          </div>
        </body>
      </html>
    `;

    const adminMailOptions = {
      from: `"QuickHealth Order System" <${process.env.GMAIL_USER}>`,
      to: process.env.ADMIN_EMAIL,
      subject: `🚨 NEW ORDER: ${orderData.orderNumber} - ₹${orderData.total} - ${orderData.customerName}`,
      html: adminEmailHtml,
    };

    console.log('📧 Sending email to admin:', process.env.ADMIN_EMAIL);
    
    // ✅ FIX: Properly await and handle the promise
    const adminInfo = await transporter.sendMail(adminMailOptions);
    console.log('✅ Admin email sent! Message ID:', adminInfo.messageId);

    return NextResponse.json({ 
      success: true, 
      message: 'Order confirmation sent to customer and admin!',
      data: {
        customer: {
          email: orderData.customerEmail,
          messageId: customerInfo.messageId, // ✅ Now properly typed
        },
        admin: {
          email: process.env.ADMIN_EMAIL,
          messageId: adminInfo.messageId, // ✅ Now properly typed
        },
        orderNumber: orderData.orderNumber,
        timestamp: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('❌ EMAIL FAILED:', error);
    return NextResponse.json({ 
      success: false,
      error: 'Failed to send emails',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
