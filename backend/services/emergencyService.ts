import User from '../models/User';
import * as turf from '@turf/turf';
import logger from '../utils/logger';
import { getProfessionalEmailTemplate } from '../utils/emailTemplates';
import { emailQueue } from '../workers/emailQueue';

export const triggerEmergency = async (data: any, user: any) => {
  const { emergencyType, severity, dangerZoneCoordinates, message } = data;
  const societyId = user.societyId;

  // 1. Log the emergency
  logger.info(`[EMERGENCY DECLARED] Type: ${emergencyType} | Severity: ${severity}`);
  logger.info(`[DANGER ZONE] ${JSON.stringify(dangerZoneCoordinates)}`);

  // 2. Find affected residents
  const allResidents = await User.find({ societyId, role: 'member' });
  let affectedResidents: any[] = [];

  if (dangerZoneCoordinates && dangerZoneCoordinates.length > 0) {
    // const dangerPolygon = turf.polygon([dangerZoneCoordinates]);
    // Simulate checking which users are in the danger zone.
    // We'll mock that 50% of the members are in the danger zone for this simulation.
    affectedResidents = allResidents.filter((_, index) => index % 2 === 0);
  } else {
    // General emergency, everyone affected
    affectedResidents = allResidents;
  }

  // 3. Dispatch Alerts
  // Simulate Twilio Voice / WhatsApp Webhooks
  const dispatchLog = affectedResidents.map(resident => {
    const payload = {
      to: resident.phone || resident.email,
      type: severity === 'CRITICAL' ? 'TWILIO_VOICE' : 'WHATSAPP_ALERT',
      message: `EMERGENCY ALERT: ${message}. Evacuate if necessary.`
    };
    logger.info(`[DISPATCH] ${payload.type} to ${resident.name} (${payload.to})`);
    return payload;
  });

  // 4. Dispatch High-Priority Red-Alert Emails to Affected Residents
  (async () => {
    try {
      const appUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
      const emergencyHtml = getProfessionalEmailTemplate({
        title: 'Emergency SOS & Security',
        subtitle: '🚨 CRITICAL SOCIETY SAFETY ALERT',
        greeting: 'Attention Resident,',
        bodyText: `An urgent emergency situation has been declared for your society:<br><br><strong>Incident Type:</strong> ${emergencyType}<br><strong>Severity Level:</strong> ${severity}<br><strong>Details & Advisory:</strong> ${message}<br><br>Please follow building safety protocols, check on vulnerable family members, and remain in a secure location until the all-clear notice is given.`,
        highlightBox: `EMERGENCY: ${emergencyType}`,
        highlightBoxLabel: `SEVERITY: ${severity} • ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`,
        actionButton: {
          text: 'Open Society Safety Portal',
          url: `${appUrl}/resident`
        },
        warningText: 'In immediate life-threatening situations, dial 112 (National Emergency Helpline) or alert the security control room immediately.',
        footerText: 'Society Emergency Response & Crisis Management Team'
      });

      for (const resident of affectedResidents) {
        if (resident.email) {
          await emailQueue.add('sendEmailJob', {
            email: resident.email,
            subject: `🚨 URGENT RED ALERT: ${emergencyType} Emergency Declared`,
            html: emergencyHtml
          });
        }
      }
    } catch (err: any) {
      logger.error('// EMERGENCY_EMAIL_BROADCAST_ERROR:', err.message);
    }
  })();

  return {
    affectedCount: affectedResidents.length,
    dispatchLog
  };
};
