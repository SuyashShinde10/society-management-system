import User from '../models/User';
import * as turf from '@turf/turf';
import logger from '../utils/logger';

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

  return {
    affectedCount: affectedResidents.length,
    dispatchLog
  };
};
