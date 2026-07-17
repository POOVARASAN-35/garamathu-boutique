import PDFDocument from 'pdfkit';

export const generateInvoicePDF = (order, res) => {
  const doc = new PDFDocument({ margin: 50 });
  
  // Set headers to stream as attachment download
  const filename = `invoice_${order.customOrderId || order._id}.pdf`;
  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
  
  doc.pipe(res);
  
  // Luxury header
  doc.fillColor('#064e3b')
     .font('Times-Roman')
     .fontSize(24)
     .text('Gramathu Boutique', 50, 45);
     
  doc.fillColor('#64748b')
     .fontSize(9)
     .font('Helvetica')
     .text('Traditional Elegance, Modern Style', 50, 72);
     
  // Order details top-right aligned
  doc.fillColor('#0f172a')
     .fontSize(9)
     .font('Helvetica')
     .text(`Invoice No: GB-INV-${String(order._id).substring(16, 24).toUpperCase()}`, 350, 45, { align: 'right' })
     .text(`Order ID: ${order.customOrderId || order._id}`, 350, 58, { align: 'right' })
     .text(`Date: ${new Date(order.createdAt).toLocaleDateString('en-IN')}`, 350, 71, { align: 'right' })
     .text(`Payment: ${order.paymentMethod} (${order.paymentStatus})`, 350, 84, { align: 'right' });
     
  // Border line separator
  doc.moveTo(50, 110).lineTo(550, 110).strokeColor('#cbd5e1').strokeWidth(1).stroke();
  
  // Customer details
  doc.fontSize(11)
     .fillColor('#0f172a')
     .font('Helvetica-Bold')
     .text('Billing Details', 50, 130);
     
  doc.fontSize(9)
     .font('Helvetica')
     .fillColor('#334155')
     .text(`Name: ${order.customerName || 'Customer'}`, 50, 150)
     .text(`Phone: ${order.shippingAddress.phone}`, 50, 163)
     .text(`Email: ${order.email || 'N/A'}`, 50, 176);
     
  // Shipping Address details
  doc.fontSize(11)
     .fillColor('#0f172a')
     .font('Helvetica-Bold')
     .text('Shipping Address', 300, 130);
     
  doc.fontSize(9)
     .font('Helvetica')
     .fillColor('#334155')
     .text(order.shippingAddress.street, 300, 150)
     .text(`${order.shippingAddress.district}, Tamil Nadu`, 300, 163)
     .text(`Pincode: ${order.shippingAddress.pincode}`, 300, 176);
     
  // Table columns heading
  let y = 220;
  doc.moveTo(50, y).lineTo(550, y).strokeColor('#cbd5e1').strokeWidth(1).stroke();
  y += 10;
  
  doc.fillColor('#0f172a')
     .font('Helvetica-Bold')
     .fontSize(9)
     .text('Item Description', 50, y)
     .text('Qty', 350, y, { width: 50, align: 'center' })
     .text('Price', 400, y, { width: 70, align: 'right' })
     .text('Total Price', 480, y, { width: 70, align: 'right' });
     
  y += 15;
  doc.moveTo(50, y).lineTo(550, y).strokeColor('#f1f5f9').strokeWidth(1).stroke();
  y += 10;
  
  // Table Rows (Items)
  doc.font('Helvetica').fillColor('#334155');
  order.items.forEach(item => {
    doc.text(item.name, 50, y, { width: 280 })
       .text(String(item.quantity), 350, y, { width: 50, align: 'center' })
       .text(`₹${item.price.toLocaleString('en-IN')}`, 400, y, { width: 70, align: 'right' })
       .text(`₹${(item.price * item.quantity).toLocaleString('en-IN')}`, 480, y, { width: 70, align: 'right' });
    y += 22;
  });
  
  doc.moveTo(50, y).lineTo(550, y).strokeColor('#cbd5e1').strokeWidth(1).stroke();
  y += 15;
  
  // Summary block
  const subtotal = order.subtotal || 0;
  const discount = order.discount || 0;
  const shipping = order.shippingCharge || 0;
  // Calculate simulated 18% GST (already inclusive or extra, let's treat it as inclusive for display)
  const gstAmount = Math.round((subtotal / 1.18) * 0.18);
  const totalAmount = order.total || 0;
  
  doc.fontSize(9)
     .text('Subtotal:', 320, y, { width: 150, align: 'right' })
     .font('Helvetica-Bold')
     .text(`₹${subtotal.toLocaleString('en-IN')}`, 480, y, { width: 70, align: 'right' });
  y += 16;
  
  if (discount > 0) {
    doc.font('Helvetica')
       .text('Discount / Coupon:', 320, y, { width: 150, align: 'right' })
       .font('Helvetica-Bold')
       .text(`-₹${discount.toLocaleString('en-IN')}`, 480, y, { width: 70, align: 'right' });
    y += 16;
  }
  
  doc.font('Helvetica')
     .text('CGST (9%):', 320, y, { width: 150, align: 'right' })
     .font('Helvetica-Bold')
     .text(`₹${Math.round(gstAmount / 2).toLocaleString('en-IN')}`, 480, y, { width: 70, align: 'right' });
  y += 16;

  doc.font('Helvetica')
     .text('SGST (9%):', 320, y, { width: 150, align: 'right' })
     .font('Helvetica-Bold')
     .text(`₹${Math.round(gstAmount / 2).toLocaleString('en-IN')}`, 480, y, { width: 70, align: 'right' });
  y += 16;
  
  doc.font('Helvetica')
     .text('Shipping Charge:', 320, y, { width: 150, align: 'right' })
     .font('Helvetica-Bold')
     .text(shipping === 0 ? 'FREE' : `₹${shipping.toLocaleString('en-IN')}`, 480, y, { width: 70, align: 'right' });
  y += 22;
  
  doc.moveTo(320, y).lineTo(550, y).strokeColor('#cbd5e1').strokeWidth(1).stroke();
  y += 10;
  
  doc.fontSize(11)
     .font('Helvetica-Bold')
     .text('Grand Total:', 320, y, { width: 150, align: 'right' })
     .fillColor('#064e3b')
     .text(`₹${totalAmount.toLocaleString('en-IN')}`, 480, y, { width: 70, align: 'right' });
     
  // Footer branding
  doc.moveDown(4);
  doc.fillColor('#94a3b8')
     .fontSize(8)
     .font('Helvetica')
     .text('Thank you for shopping with Gramathu Boutique! ❤️', 50, doc.page.height - 70, { align: 'center' })
     .text('Need help? Contact support@gramathuboutique.com or WhatsApp us at +91 63694 68700', 50, doc.page.height - 55, { align: 'center' });
     
  doc.end();
};
