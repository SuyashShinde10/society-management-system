const { sendComplaintNotificationToAdmins, sendComplaintStatusUpdateToUser } = require('../../services/emailService');
const { emailQueue } = require('../../workers/emailQueue');

describe('Email Service', () => {
  let addSpy;

  beforeEach(() => {
    addSpy = jest.spyOn(emailQueue, 'add').mockImplementation(async () => ({}));
  });

  afterEach(() => {
    addSpy.mockRestore();
  });

  it('should queue an email for each admin', () => {
    const admins = [{ email: 'admin1@test.com' }, { email: 'admin2@test.com' }];
    const complaint = { title: 'No Water', description: 'Water is out in block A' };

    sendComplaintNotificationToAdmins(admins, complaint);

    expect(addSpy).toHaveBeenCalledTimes(2);
    expect(addSpy).toHaveBeenCalledWith('sendEmailJob', expect.objectContaining({
      email: 'admin1@test.com',
      subject: 'New Complaint Logged: No Water'
    }));
    expect(addSpy).toHaveBeenCalledWith('sendEmailJob', expect.objectContaining({
      email: 'admin2@test.com',
      subject: 'New Complaint Logged: No Water'
    }));
  });

  it('should queue status update email to user', () => {
    const user = { name: 'John Doe', email: 'user@test.com' };
    const complaint = { title: 'Broken Lift' };
    const status = 'Resolved';

    sendComplaintStatusUpdateToUser(user, complaint, status);

    expect(addSpy).toHaveBeenCalledTimes(1);
    expect(addSpy).toHaveBeenCalledWith('sendEmailJob', expect.objectContaining({
      email: 'user@test.com',
      subject: 'Complaint Status Updated: Broken Lift'
    }));
  });
});
