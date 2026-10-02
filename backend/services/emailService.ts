import { getProfessionalEmailTemplate } from '../utils/emailTemplates';
import { emailQueue } from '../workers/emailQueue';

export const sendComplaintNotificationToAdmins = (admins: any[], complaint: any) => {
  const appUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
  const html = getProfessionalEmailTemplate({
    title: 'Helpdesk Alert',
    subtitle: 'NEW RESIDENT COMPLAINT LOGGED',
    greeting: 'Hello Society Administrator,',
    bodyText: `A new resident grievance ticket has been filed in the helpdesk portal.<br><br><strong>Ticket Title:</strong> ${complaint.title}<br><strong>Description:</strong> ${complaint.description || 'No additional details provided.'}`,
    highlightBox: complaint.title,
    highlightBoxLabel: `Category: ${complaint.category || 'General Issue'}`,
    actionButton: {
      text: 'View & Assign in Admin Dashboard',
      url: `${appUrl}/dashboard`
    },
    footerText: 'Please review and assign a resolution status in the admin dashboard.'
  });

  admins.forEach(admin => {
    emailQueue.add('sendEmailJob', {
      email: admin.email,
      subject: `New Complaint Logged: ${complaint.title}`,
      message: `A new complaint has been filed by a resident.\n\nTitle: ${complaint.title}\nDescription: ${complaint.description}\n\nPlease review it in the admin dashboard.`,
      html
    });
  });
};

export const sendComplaintStatusUpdateToUser = (user: any, complaint: any, status: string) => {
  const appUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
  const html = getProfessionalEmailTemplate({
    title: 'Helpdesk Ticket Update',
    subtitle: 'COMPLAINT RESOLUTION PROGRESS',
    greeting: `Hello ${user.name},`,
    bodyText: `The status of your complaint regarding "<strong>${complaint.title}</strong>" has been updated to: <strong>${status}</strong>.<br><br>Our facility management team has logged this action in your society maintenance ledger.`,
    highlightBox: status,
    highlightBoxLabel: 'Current Ticket Status',
    actionButton: {
      text: 'View Ticket in Resident Portal',
      url: `${appUrl}/resident`
    },
    footerText: 'If your issue has not been satisfactorily resolved, you can reopen it via the portal.'
  });

  emailQueue.add('sendEmailJob', {
    email: user.email,
    subject: `Complaint Status Updated: ${complaint.title}`,
    message: `Hello ${user.name},\n\nThe status of your complaint regarding "${complaint.title}" has been updated to: ${status}.\n\nPlease check the portal for more details.`,
    html
  });
};
