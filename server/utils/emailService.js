import nodemailer from 'nodemailer';

// Helper to format Date nicely
const formatDate = (dateVal) => {
  if (!dateVal) return 'N/A';
  const d = new Date(dateVal);
  return d.toLocaleDateString('en-US', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });
};

export const sendOrderStatusEmail = async (order, userDetails) => {
  const customerEmail = userDetails?.email || 'customer@example.com';
  const customerName = userDetails?.firstName 
    ? `${userDetails.firstName} ${userDetails.lastName || ''}`.trim() 
    : 'Customer';

  const orderId = order.customOrderId || order._id.toString();
  const estDate = formatDate(order.estimatedDeliveryDate);
  const status = order.orderStatus;
  const courier = order.courierPartner || 'DTDC';
  const trackingNo = order.trackingNumber || 'N/A';

  // Determine email subject & text based on status
  let subject = '';
  let statusMessage = '';
  let isShipped = false;
  let isDelivered = false;

  switch (status) {
    case 'Order Confirmed':
      subject = `Your Gramathu Boutique Order has been Confirmed 🎉`;
      statusMessage = `Thank you for shopping with Gramathu Boutique. Your order has been successfully placed.`;
      break;
    case 'Preparing':
      subject = `Your Gramathu Boutique order is being prepared 📦`;
      statusMessage = `We are currently preparing your items for packaging. We will update you once it's ready.`;
      break;
    case 'Packed':
      subject = `Your Gramathu Boutique order has been packed 🏷️`;
      statusMessage = `Great news! Your package is packed and waiting for the courier partner to pick it up.`;
      break;
    case 'Shipped':
      subject = `Your Gramathu Boutique order has been shipped 🚚`;
      statusMessage = `Your order has been handed over to our courier partner.`;
      isShipped = true;
      break;
    case 'Out for Delivery':
      subject = `Out for Delivery: Your package will arrive today 🏃‍♂️`;
      statusMessage = `Your package is out for delivery with our executive and will reach you today.`;
      break;
    case 'Delivered':
      subject = `Delivered Successfully: Hope you enjoy your purchase ❤️`;
      statusMessage = `Your package has been successfully delivered. Thank you for choosing Gramathu Boutique!`;
      isDelivered = true;
      break;
    case 'Cancelled':
      subject = `Order Cancelled - Gramathu Boutique`;
      statusMessage = `Your order has been cancelled. If you did not request this, please contact our support team.`;
      break;
    default:
      subject = `Order Status Update: ${status} - Gramathu Boutique`;
      statusMessage = `The status of your order has been updated to: ${status}.`;
  }

  // Items table generation
  let itemsHtml = '';
  if (order.items && order.items.length > 0) {
    itemsHtml = order.items.map(item => `
      <tr>
        <td style="padding: 10px; border-bottom: 1px solid #eee;">
          <strong>${item.name}</strong><br>
          <span style="font-size: 11px; color: #666;">Qty: ${item.quantity}</span>
        </td>
        <td style="padding: 10px; text-align: right; border-bottom: 1px solid #eee;">
          ₹${item.price.toLocaleString('en-IN')}
        </td>
      </tr>
    `).join('');
  }

  const shippingCostText = order.shippingCharge === 0 ? 'FREE' : `₹${order.shippingCharge}`;

  // Complete HTML template
  const htmlContent = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 8px; overflow: hidden; color: #334155;">
      <div style="background-color: #064e3b; padding: 24px; text-align: center; color: white;">
        <h1 style="margin: 0; font-family: Georgia, serif; font-size: 24px; letter-spacing: 2px;">Gramathu Boutique</h1>
        <p style="margin: 4px 0 0 0; font-size: 12px; text-transform: uppercase; color: #fbbf24; tracking-widest: 1px;">Traditional Elegance</p>
      </div>
      
      <div style="padding: 24px; background-color: #ffffff;">
        <p>Hello ${customerName},</p>
        <p>${statusMessage}</p>
        
        <table style="width: 100%; margin-top: 20px; border-collapse: collapse; font-size: 13px;">
          <tr>
            <td style="padding: 6px 0; font-weight: bold; width: 120px;">Order ID:</td>
            <td style="padding: 6px 0; color: #000; font-family: monospace; font-size: 14px;"><strong>${orderId}</strong></td>
          </tr>
          <tr>
            <td style="padding: 6px 0; font-weight: bold;">Estimated Delivery:</td>
            <td style="padding: 6px 0;">${estDate}</td>
          </tr>
          <tr>
            <td style="padding: 6px 0; font-weight: bold;">Shipping Method:</td>
            <td style="padding: 6px 0;">Standard Delivery</td>
          </tr>
          ${isShipped ? `
          <tr>
            <td style="padding: 6px 0; font-weight: bold; color: #065f46;">Courier Partner:</td>
            <td style="padding: 6px 0;">${courier}</td>
          </tr>
          <tr>
            <td style="padding: 6px 0; font-weight: bold; color: #065f46;">Tracking ID:</td>
            <td style="padding: 6px 0; font-family: monospace;"><strong>${trackingNo}</strong></td>
          </tr>
          ` : ''}
          <tr>
            <td style="padding: 6px 0; font-weight: bold;">Status:</td>
            <td style="padding: 6px 0;"><span style="background-color: #ecfdf5; color: #047857; padding: 3px 8px; border-radius: 4px; font-weight: bold; font-size: 11px; text-transform: uppercase;">${status}</span></td>
          </tr>
        </table>
        
        <h4 style="margin: 24px 0 10px 0; padding-bottom: 6px; border-bottom: 2px solid #064e3b; color: #064e3b;">Items Ordered</h4>
        <table style="width: 100%; border-collapse: collapse; font-size: 13px;">
          ${itemsHtml}
          <tr>
            <td style="padding: 10px 10px 5px 10px; text-align: right; font-weight: bold;">Subtotal:</td>
            <td style="padding: 10px 10px 5px 10px; text-align: right;">₹${order.subtotal.toLocaleString('en-IN')}</td>
          </tr>
          ${order.discount > 0 ? `
          <tr>
            <td style="padding: 5px 10px; text-align: right; font-weight: bold; color: #b91c1c;">Discount:</td>
            <td style="padding: 5px 10px; text-align: right; color: #b91c1c;">-₹${order.discount.toLocaleString('en-IN')}</td>
          </tr>
          ` : ''}
          <tr>
            <td style="padding: 5px 10px; text-align: right; font-weight: bold;">Shipping:</td>
            <td style="padding: 5px 10px; text-align: right;">${shippingCostText}</td>
          </tr>
          <tr>
            <td style="padding: 10px; text-align: right; font-weight: bold; font-size: 15px; border-top: 1px solid #ddd;">Total Paid:</td>
            <td style="padding: 10px; text-align: right; font-weight: bold; font-size: 15px; border-top: 1px solid #ddd; color: #064e3b;">₹${order.total.toLocaleString('en-IN')}</td>
          </tr>
        </table>
        
        <h4 style="margin: 24px 0 10px 0; padding-bottom: 6px; border-bottom: 2px solid #064e3b; color: #064e3b;">Shipping Address</h4>
        <p style="font-size: 13px; line-height: 1.5; margin: 0; background-color: #f8fafc; padding: 12px; border-radius: 6px; border: 1px dashed #cbd5e1;">
          <strong>${customerName}</strong><br>
          ${order.shippingAddress.street},<br>
          ${order.shippingAddress.district},<br>
          Tamil Nadu - ${order.shippingAddress.pincode}<br>
          Phone: ${order.shippingAddress.phone}
        </p>

        <div style="text-align: center; margin-top: 30px; margin-bottom: 10px;">
          <a href="http://localhost:5173/track-order/${orderId}" style="background-color: #d97706; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; font-size: 13px; display: inline-block;">Track My Order</a>
        </div>
      </div>
      
      <div style="background-color: #f8fafc; padding: 16px; text-align: center; font-size: 11px; border-top: 1px solid #e2e8f0; color: #64748b;">
        <p style="margin: 0;">Need Help? Contact us at <a href="mailto:support@gramathuboutique.com" style="color: #064e3b; text-decoration: underline;">support@gramathuboutique.com</a></p>
        <p style="margin: 4px 0 0 0;">&copy; 2026 Gramathu Boutique. All rights reserved.</p>
      </div>
    </div>
  `;

  // Setup transporter
  if (process.env.SMTP_HOST && process.env.SMTP_USER) {
    console.log(`[EMAIL INFO] Attempting to send order status email via SMTP (${process.env.SMTP_HOST}:${process.env.SMTP_PORT || 587}) to ${customerEmail}`);
    try {
      const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: Number(process.env.SMTP_PORT) || 587,
        secure: process.env.SMTP_SECURE === 'true',
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS
        },
        tls: {
          rejectUnauthorized: false
        }
      });

      await transporter.sendMail({
        from: `"Gramathu Boutique" <${process.env.SMTP_USER}>`,
        to: customerEmail,
        subject: subject,
        html: htmlContent
      });
      console.log(`[EMAIL SENT] Order Status Email sent successfully to ${customerEmail} (Status: ${status})`);
      return;
    } catch (err) {
      console.error('\n==================== EMAIL SENDING ERROR ====================');
      console.error(`[EMAIL ERROR] Failed to send email to ${customerEmail}`);
      console.error('Error Code:', err.code);
      console.error('Error Command:', err.command);
      console.error('SMTP Response:', err.response);
      console.error('Error Details:', err);
      console.error('=============================================================\n');
    }
  } else {
    console.log(`[EMAIL WARNING] SMTP_HOST or SMTP_USER is not configured in .env. SMTP_HOST: ${process.env.SMTP_HOST}, SMTP_USER: ${process.env.SMTP_USER}`);
  }

  // Fallback logging in console
  console.log(`
============================================================
[SIMULATED EMAIL LOG] - OUTBOX
------------------------------------------------------------
To: ${customerEmail}
Subject: ${subject}
Status Transition: ${status}
------------------------------------------------------------
Body:
${statusMessage}

Order Details:
- Order ID: ${orderId}
- Estimated Delivery: ${estDate}
- Paid Total: ₹${order.total.toLocaleString('en-IN')}
- Tracking ID: ${trackingNo} (${courier})
- Shipping Address: ${order.shippingAddress.street}, ${order.shippingAddress.district}, TN - ${order.shippingAddress.pincode}
============================================================
`);
};

export const sendContactFormEmails = async (contactDetails) => {
  const { name, email, phone, subject, message } = contactDetails;
  const adminEmail = process.env.SMTP_USER || 'arasu5070go@gmail.com';

  const adminHtml = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 8px; overflow: hidden; color: #334155;">
      <div style="background-color: #064e3b; padding: 20px; text-align: center; color: white;">
        <h1 style="margin: 0; font-family: Georgia, serif; font-size: 22px; letter-spacing: 1px;">Gramathu Boutique</h1>
        <p style="margin: 4px 0 0 0; font-size: 11px; text-transform: uppercase; color: #fbbf24; tracking-widest: 1px;">New Contact Submission</p>
      </div>
      
      <div style="padding: 24px; background-color: #ffffff; font-size: 13px; line-height: 1.6;">
        <h3 style="color: #064e3b; border-bottom: 1px solid #e2e8f0; padding-bottom: 8px; margin-top: 0;">Submission Details</h3>
        <table style="width: 100%; border-collapse: collapse;">
          <tr>
            <td style="padding: 6px 0; font-weight: bold; width: 100px;">Name:</td>
            <td style="padding: 6px 0;">${name}</td>
          </tr>
          <tr>
            <td style="padding: 6px 0; font-weight: bold;">Email:</td>
            <td style="padding: 6px 0;"><a href="mailto:${email}">${email}</a></td>
          </tr>
          <tr>
            <td style="padding: 6px 0; font-weight: bold;">Phone:</td>
            <td style="padding: 6px 0;">${phone || 'N/A'}</td>
          </tr>
          <tr>
            <td style="padding: 6px 0; font-weight: bold;">Subject:</td>
            <td style="padding: 6px 0;">${subject || 'No Subject'}</td>
          </tr>
        </table>
        
        <h3 style="color: #064e3b; border-bottom: 1px solid #e2e8f0; padding-bottom: 8px; margin-top: 24px;">Message Content</h3>
        <p style="background-color: #f8fafc; padding: 16px; border-radius: 6px; border: 1px solid #e2e8f0; font-style: italic; white-space: pre-wrap; margin: 0;">
          ${message}
        </p>
      </div>
    </div>
  `;

  const customerHtml = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 8px; overflow: hidden; color: #334155;">
      <div style="background-color: #064e3b; padding: 20px; text-align: center; color: white;">
        <h1 style="margin: 0; font-family: Georgia, serif; font-size: 22px; letter-spacing: 1px;">Gramathu Boutique</h1>
        <p style="margin: 4px 0 0 0; font-size: 11px; text-transform: uppercase; color: #fbbf24; tracking-widest: 1px;">We received your message</p>
      </div>
      
      <div style="padding: 24px; background-color: #ffffff; font-size: 13px; line-height: 1.6;">
        <p>Hello <strong>${name}</strong>,</p>
        <p>Thank you for reaching out to Gramathu Boutique! We have received your inquiry regarding "<strong>${subject || 'General Inquiry'}</strong>".</p>
        <p>Our team will review your message and get back to you within 24 to 48 business hours.</p>
        
        <div style="background-color: #f8fafc; padding: 16px; border-radius: 6px; border: 1px dashed #cbd5e1; margin-top: 20px;">
          <strong style="color: #064e3b;">Your Message:</strong>
          <p style="margin: 8px 0 0 0; font-style: italic; white-space: pre-wrap;">${message}</p>
        </div>
      </div>
      
      <div style="background-color: #f8fafc; padding: 16px; text-align: center; font-size: 11px; border-top: 1px solid #e2e8f0; color: #64748b;">
        <p style="margin: 0;">Need immediate assistance? Call us at <a href="tel:+916369468700" style="color: #064e3b; text-decoration: underline;">+91 63694 68700</a></p>
        <p style="margin: 4px 0 0 0;">&copy; 2026 Gramathu Boutique. All rights reserved.</p>
      </div>
    </div>
  `;

  if (process.env.SMTP_HOST && process.env.SMTP_USER) {
    console.log(`[EMAIL INFO] Attempting to send contact form emails via SMTP (${process.env.SMTP_HOST}:${process.env.SMTP_PORT || 587}) to Admin (${adminEmail}) and Customer (${email})`);
    try {
      const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: Number(process.env.SMTP_PORT) || 587,
        secure: process.env.SMTP_SECURE === 'true',
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS
        },
        tls: {
          rejectUnauthorized: false
        }
      });

      // 1. Send notification to admin
      await transporter.sendMail({
        from: `"Gramathu Boutique Web Contact" <${process.env.SMTP_USER}>`,
        to: adminEmail,
        subject: `New Inquiry: ${subject || 'Gramathu Boutique Contact Form'}`,
        html: adminHtml
      });

      // 2. Send confirmation receipt to customer
      await transporter.sendMail({
        from: `"Gramathu Boutique" <${process.env.SMTP_USER}>`,
        to: email,
        subject: `We've received your message - Gramathu Boutique`,
        html: customerHtml
      });

      console.log(`[CONTACT EMAIL SENT] Notifications sent successfully to Admin (${adminEmail}) and Customer (${email})`);
      return;
    } catch (err) {
      console.error('\n==================== CONTACT EMAIL ERROR ====================');
      console.error(`[EMAIL ERROR] Failed to send contact emails`);
      console.error('Error Code:', err.code);
      console.error('Error Command:', err.command);
      console.error('SMTP Response:', err.response);
      console.error('Error Details:', err);
      console.error('=============================================================\n');
    }
  } else {
    console.log(`[EMAIL WARNING] SMTP_HOST or SMTP_USER is not configured in .env for contact emails.`);
  }

  console.log(`
============================================================
[SIMULATED CONTACT EMAIL]
To Admin: ${adminEmail}
To Customer: ${email}
Subject: ${subject}
Message: ${message}
============================================================
  `);
};
