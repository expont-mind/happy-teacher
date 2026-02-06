import { NextResponse } from "next/server";
import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT) || 587,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

interface OrderNotificationRequest {
  orderCode: string;
  productTitle: string;
  productPrice: number;
  deliveryFee: number;
  recipientName: string;
  phone: string;
  zoneName: string;
  locationName: string;
  address: string;
  notes?: string;
}

export async function POST(request: Request) {
  try {
    const body: OrderNotificationRequest = await request.json();
    const {
      orderCode,
      productTitle,
      productPrice,
      deliveryFee,
      recipientName,
      phone,
      zoneName,
      locationName,
      address,
      notes,
    } = body;

    if (!orderCode || !productTitle || !recipientName || !phone) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const totalPrice = productPrice + deliveryFee;
    const adminEmail = process.env.ADMIN_EMAIL || process.env.SMTP_USER;

    if (!adminEmail) {
      console.warn("No admin email configured for order notifications");
      return NextResponse.json({
        success: true,
        emailSent: false,
        message: "No admin email configured",
      });
    }

    if (!process.env.SMTP_HOST || !process.env.SMTP_USER) {
      console.warn("SMTP not configured, skipping email notification");
      return NextResponse.json({
        success: true,
        emailSent: false,
        message: "SMTP not configured",
      });
    }

    const emailHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; margin: 0; padding: 0; background-color: #f4f4f5; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .card { background: white; border-radius: 12px; box-shadow: 0 2px 8px rgba(0,0,0,0.1); overflow: hidden; }
          .header { background: linear-gradient(135deg, #58CC02 0%, #46A302 100%); color: white; padding: 24px; text-align: center; }
          .header h1 { margin: 0; font-size: 24px; }
          .header p { margin: 8px 0 0; opacity: 0.9; }
          .content { padding: 24px; }
          .section { margin-bottom: 20px; }
          .section-title { font-size: 14px; color: #6b7280; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 12px; font-weight: 600; }
          .info-row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #f3f4f6; }
          .info-row:last-child { border-bottom: none; }
          .info-label { color: #6b7280; }
          .info-value { font-weight: 600; color: #1f2937; }
          .order-code { background: #f3f4f6; padding: 12px 16px; border-radius: 8px; font-family: monospace; font-size: 18px; text-align: center; letter-spacing: 2px; color: #1f2937; }
          .price-total { background: #ecfdf5; padding: 16px; border-radius: 8px; text-align: center; }
          .price-total .amount { font-size: 28px; font-weight: 700; color: #059669; }
          .price-total .label { color: #6b7280; font-size: 14px; }
          .address-box { background: #f9fafb; padding: 16px; border-radius: 8px; border-left: 4px solid #58CC02; }
          .notes-box { background: #fffbeb; padding: 16px; border-radius: 8px; border-left: 4px solid #f59e0b; }
          .footer { text-align: center; padding: 20px; color: #9ca3af; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="card">
            <div class="header">
              <h1>🛒 Шинэ захиалга ирлээ!</h1>
              <p>Happy Academy Shop</p>
            </div>
            <div class="content">
              <div class="section">
                <div class="section-title">Захиалгын код</div>
                <div class="order-code">${orderCode}</div>
              </div>

              <div class="section">
                <div class="section-title">Бүтээгдэхүүн</div>
                <div class="info-row">
                  <span class="info-label">Нэр</span>
                  <span class="info-value">${productTitle}</span>
                </div>
                <div class="info-row">
                  <span class="info-label">Үнэ</span>
                  <span class="info-value">${productPrice.toLocaleString()}₮</span>
                </div>
                <div class="info-row">
                  <span class="info-label">Хүргэлт</span>
                  <span class="info-value">${deliveryFee.toLocaleString()}₮</span>
                </div>
              </div>

              <div class="section">
                <div class="price-total">
                  <div class="label">Нийт төлбөр</div>
                  <div class="amount">${totalPrice.toLocaleString()}₮</div>
                </div>
              </div>

              <div class="section">
                <div class="section-title">Хүлээн авагч</div>
                <div class="info-row">
                  <span class="info-label">Нэр</span>
                  <span class="info-value">${recipientName}</span>
                </div>
                <div class="info-row">
                  <span class="info-label">Утас</span>
                  <span class="info-value">${phone}</span>
                </div>
              </div>

              <div class="section">
                <div class="section-title">Хүргэлтийн хаяг</div>
                <div class="address-box">
                  <strong>${zoneName}</strong><br>
                  ${locationName}<br>
                  ${address}
                </div>
              </div>

              ${notes ? `
              <div class="section">
                <div class="section-title">Нэмэлт тэмдэглэл</div>
                <div class="notes-box">${notes}</div>
              </div>
              ` : ''}
            </div>
            <div class="footer">
              <p>Захиалгыг admin хуудаснаас удирдах боломжтой</p>
              <p>© ${new Date().getFullYear()} Happy Academy</p>
            </div>
          </div>
        </div>
      </body>
      </html>
    `;

    await transporter.sendMail({
      from: "Happy Academy <noreply@happyacademy.mn>",
      to: adminEmail,
      subject: `🛒 Шинэ захиалга: ${orderCode} - ${productTitle}`,
      html: emailHtml,
    });

    console.log(`Order notification email sent for order: ${orderCode}`);

    return NextResponse.json({
      success: true,
      emailSent: true,
      message: "Order notification sent successfully",
    });
  } catch (error: any) {
    console.error("Order notification error:", error);
    return NextResponse.json(
      {
        success: false,
        emailSent: false,
        error: error.message,
      },
      { status: 500 }
    );
  }
}
