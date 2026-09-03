import { jsPDF } from 'jspdf';
import { toast } from 'sonner';

export const handleDownloadInvoice = (bill, user) => {
  try {
    const doc = new jsPDF();
    const isPaid = bill.status === 'Paid';
    const docTitle = isPaid ? 'PAYMENT RECEIPT' : 'MAINTENANCE BILL';
    
    // Header Section
    doc.setFont('courier', 'bold');
    doc.setFontSize(22);
    doc.text(docTitle, 105, 20, null, null, 'center');
    
    doc.setFontSize(14);
    const societyName = user?.societyName || 'Awaastech Society';
    doc.text(societyName.toUpperCase(), 105, 30, null, null, 'center');
    
    doc.setFontSize(10);
    doc.setFont('courier', 'normal');
    const locationText = user?.societyCity ? `Location: ${user.societyCity}` : 'Authorized Society Document';
    doc.text(locationText, 105, 36, null, null, 'center');
    
    doc.line(20, 42, 190, 42);
    
    // Bill Information
    doc.setFont('courier', 'bold');
    doc.setFontSize(12);
    doc.text(`Bill ID: ${bill._id}`, 20, 52);
    doc.text(`Date: ${new Date().toLocaleDateString()}`, 140, 52);
    
    // Resident Information
    doc.setFont('courier', 'normal');
    doc.text('Billed To:', 20, 67);
    doc.text(`${bill.userId?.name || 'Resident'}`, 20, 75);
    if (bill.userId?.flatDetails) {
      doc.text(`Wing: ${bill.userId.flatDetails.wing} | Flat: ${bill.userId.flatDetails.flatNumber}`, 20, 83);
    }

    // Bill Details
    doc.text(`Title: ${bill.title}`, 20, 97);
    doc.text(`Description: ${bill.description || 'N/A'}`, 20, 105);
    doc.text(`Due Date: ${new Date(bill.dueDate).toLocaleDateString()}`, 20, 113);
    
    // Financials
    doc.setFont('courier', 'bold');
    doc.setFontSize(14);
    doc.text(`Amount Due: Rs. ${bill.amount.toLocaleString()}`, 20, 127);
    
    if (bill.paymentMode) {
      doc.setFontSize(12);
      doc.text(`Payment Mode: ${bill.paymentMode}`, 20, 137);
    }
    
    doc.setFontSize(12);
    doc.text(`Status: ${bill.status.toUpperCase()}`, 140, 127);

    // Status Stamp
    if (isPaid) {
      doc.setTextColor(0, 128, 0); // Green
      doc.text('PAID IN FULL', 105, 147, null, null, 'center');
    } else if (bill.status === 'Under Verification') {
      doc.setTextColor(220, 100, 0); // Orange
      doc.text('PAYMENT UNDER VERIFICATION', 105, 147, null, null, 'center');
    } else {
      doc.setTextColor(255, 0, 0); // Red
      doc.text('PAYMENT PENDING', 105, 147, null, null, 'center');
    }

    // Footer
    doc.setTextColor(0, 0, 0);
    doc.setFont('courier', 'normal');
    doc.setFontSize(10);
    doc.line(20, 270, 190, 270);
    doc.text(isPaid ? 'Thank you for your prompt payment!' : 'Please clear your dues before the due date.', 105, 280, null, null, 'center');

    doc.save(`${isPaid ? 'Receipt' : 'Bill'}_${bill.title.replace(/\s+/g, '_')}_${bill._id.slice(-6)}.pdf`);
  } catch (err) {
    console.error('PDF Generation Error:', err);
    toast.error('Failed to generate PDF');
  }
};
