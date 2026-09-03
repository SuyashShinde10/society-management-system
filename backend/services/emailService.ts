import { getProfessionalEmailTemplate } from '../utils/emailTemplates';
import { emailQueue } from '../workers/emailQueue';

export const sendComplaintNotificationToAdmins = (admins: any[], complaint: any) => {
  const html = getProfessionalEmailTemplate({
    subtitle: 'NEW COMPLAINT LOGGED',
    greeting: 'Hello Admin,',
    bodyText: `A new complaint has been filed by a resident in the system.`,
    highlightBox: complaint.title,
    highlightBoxLabel: 'Complaint Title',
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
  const html = getProfessionalEmailTemplate({
    subtitle: 'COMPLAINT STATUS UPDATE',
    greeting: `Hello ${user.name},`,
    bodyText: `The status of your complaint regarding "<strong>${complaint.title}</strong>" has been updated.`,
    highlightBox: status,
    highlightBoxLabel: 'New Status',
    footerText: 'Log in to the portal for more details.'
  });

  emailQueue.add('sendEmailJob', {
    email: user.email,
    subject: `Complaint Status Updated: ${complaint.title}`,
    message: `Hello ${user.name},\n\nThe status of your complaint regarding "${complaint.title}" has been updated to: ${status}.\n\nPlease check the portal for more details.`,
    html
  });
};
