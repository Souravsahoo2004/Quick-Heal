import { NextRequest, NextResponse } from 'next/server'
import nodemailer from 'nodemailer'

interface AppointmentRequest {
  name: string
  email: string
  date: string
  doctor: string
  message?: string
}

export async function POST(request: NextRequest) {
  try {
    const { name, email, date, doctor, message }: AppointmentRequest = await request.json()

    // Check if credentials exist
    if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
      return NextResponse.json(
        { error: 'SMTP credentials not configured' },
        { status: 500 }
      )
    }

    // Create transporter
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    })

    // Send email to admin
    await transporter.sendMail({
      from: process.env.SMTP_USER,
      to: 'souravsahoo72051@gmail.com', // Your admin email
      subject: `New Doctor Appointment Request - ${name}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #0891b2 0%, #06b6d4 100%); padding: 30px; border-radius: 12px 12px 0 0; text-align: center;">
            <h1 style="color: white; margin: 0; font-size: 24px;">🏥 New Appointment Request</h1>
          </div>
          
          <div style="background: #ffffff; padding: 30px; border: 1px solid #e5e7eb; border-top: none;">
            <div style="background-color: #f0f9ff; padding: 25px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #0891b2;">
              <h3 style="margin-top: 0; color: #0369a1; margin-bottom: 15px;">👤 Patient Details</h3>
              <div style="display: grid; gap: 10px;">
                <p style="margin: 0; padding: 8px 0; border-bottom: 1px solid #e0f2fe;"><strong>Name:</strong> ${name}</p>
                <p style="margin: 0; padding: 8px 0; border-bottom: 1px solid #e0f2fe;"><strong>Email:</strong> ${email}</p>
                <p style="margin: 0; padding: 8px 0; border-bottom: 1px solid #e0f2fe;"><strong>Preferred Date:</strong> ${new Date(date).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
                <p style="margin: 0; padding: 8px 0; border-bottom: 1px solid #e0f2fe;"><strong>Doctor Requested:</strong> ${doctor}</p>
                ${message ? `<p style="margin: 0; padding: 8px 0;"><strong>Health Concern:</strong> ${message}</p>` : ''}
              </div>
            </div>
            
            <div style="background-color: #fef3c7; padding: 15px; border-radius: 8px; border-left: 4px solid #f59e0b; margin-top: 20px;">
              <p style="margin: 0; color: #92400e;"><strong>⚡ Action Required:</strong> Please review this appointment request and contact the patient within 24 hours.</p>
            </div>
          </div>
          
          <div style="background-color: #f8fafc; padding: 20px; border-radius: 0 0 12px 12px; text-align: center; border: 1px solid #e5e7eb; border-top: none;">
            <p style="color: #6b7280; font-size: 14px; margin: 0;">
              This appointment request was submitted through your website appointment form.<br>
              <strong>Timestamp:</strong> ${new Date().toLocaleString()}
            </p>
          </div>
        </div>
      `,
    })

    // Send confirmation to patient
    await transporter.sendMail({
      from: process.env.SMTP_USER,
      to: email,
      subject: 'Appointment Request Confirmation ✅',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); padding: 30px; border-radius: 12px 12px 0 0; text-align: center;">
            <h1 style="color: white; margin: 0; font-size: 24px;">✅ Appointment Request Received</h1>
          </div>
          
          <div style="background: #ffffff; padding: 30px; border: 1px solid #e5e7eb; border-top: none;">
            <p style="font-size: 18px; color: #1f2937; margin-top: 0;">Dear ${name},</p>
            
            <p style="color: #4b5563; line-height: 1.6;">Thank you for your appointment request! We have successfully received your information and our medical team will review it promptly.</p>
            
            <div style="background-color: #f0f9ff; padding: 25px; border-radius: 8px; margin: 25px 0; border-left: 4px solid #3b82f6;">
              <h3 style="margin-top: 0; color: #1e40af; margin-bottom: 15px;">📋 Your Appointment Details</h3>
              <div style="display: grid; gap: 10px;">
                <p style="margin: 0; padding: 8px 0; border-bottom: 1px solid #dbeafe;"><strong>👨‍⚕️ Doctor:</strong> ${doctor}</p>
                <p style="margin: 0; padding: 8px 0; border-bottom: 1px solid #dbeafe;"><strong>📅 Preferred Date:</strong> ${new Date(date).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
                ${message ? `<p style="margin: 0; padding: 8px 0;"><strong>💬 Your Concern:</strong> ${message}</p>` : ''}
              </div>
            </div>
            
            <div style="background-color: #dcfce7; padding: 20px; border-radius: 8px; border-left: 4px solid #22c55e;">
              <h4 style="margin: 0 0 10px 0; color: #166534;">🚀 What Happens Next?</h4>
              <ul style="margin: 0; padding-left: 20px; color: #166534; line-height: 1.6;">
                <li>Our medical team will review your appointment request</li>
                <li>We'll contact you within <strong>24 hours</strong> to confirm your appointment time</li>
                <li>You'll receive a confirmation with the exact appointment details</li>
                <li>Please keep this email for your records</li>
              </ul>
            </div>

            <div style="background-color: #fef3c7; padding: 15px; border-radius: 8px; border-left: 4px solid #f59e0b; margin-top: 20px;">
              <p style="margin: 0; color: #92400e;"><strong>📞 Need to make changes?</strong> Please contact us at <strong>${process.env.SMTP_USER}</strong> or call our office directly.</p>
            </div>
          </div>
          
          <div style="background-color: #f8fafc; padding: 20px; border-radius: 0 0 12px 12px; text-align: center; border: 1px solid #e5e7eb; border-top: none;">
            <p style="color: #6b7280; font-size: 16px; margin: 0;">
              Thank you for choosing our healthcare services! 🏥<br>
              <small style="font-size: 12px;">Request ID: ${Date.now()}</small>
            </p>
          </div>
        </div>
      `,
    })

    return NextResponse.json({ 
      success: true, 
      message: 'Appointment request sent successfully! Check your email for confirmation.',
      appointmentDetails: {
        name,
        doctor,
        date: new Date(date).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }),
        email
      }
    })

  } catch (error) {
    console.error('❌ Email sending failed:', error)
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred'
    
    return NextResponse.json(
      { error: `Failed to send appointment request: ${errorMessage}` },
      { status: 500 }
    )
  }
}

// Optional: GET method for testing
export async function GET() {
  return NextResponse.json({
    message: 'Doctor Appointments API is running! 🏥',
    status: 'operational',
    timestamp: new Date().toISOString()
  })
}
