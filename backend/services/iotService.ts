import User from '../models/User';
import logger from '../utils/logger';

// Mock external IoT API interaction
const fetchIoTMeterData = async (unitId: string) => {
  // Simulate fetching data for electricity (kWh) and water (Liters)
  // We'll generate random variations, occasionally creating a massive anomaly
  const isAnomaly = Math.random() > 0.9;
  return {
    electricityUsage: isAnomaly ? 850.5 : (Math.random() * 50 + 100), // Anomaly: 850kWh vs normal 100kWh
    waterUsage: isAnomaly ? 5000 : (Math.random() * 100 + 400),       // Anomaly: 5000L vs normal 400L
  };
};

export const pollIoTData = async (user: any) => {
  const societyId = user.societyId;
  const residents = await User.find({ societyId, role: 'member' });
  
  let anomaliesDetected: any[] = [];

  // Simulate CRON job iterating over all connected units
  for (const resident of residents) {
    // In a real system, resident has a linked meter ID
    const usage = await fetchIoTMeterData(resident._id.toString());

    // Thresholds for anomalies
    const ELECTRICITY_THRESHOLD = 500;
    const WATER_THRESHOLD = 2000;

    if (usage.electricityUsage > ELECTRICITY_THRESHOLD || usage.waterUsage > WATER_THRESHOLD) {
      anomaliesDetected.push({
        resident: resident.name,
        phone: resident.phone,
        usage,
        alert: 'Abnormal spike detected.'
      });
      
      // Dispatch alert (simulated)
      logger.info(`[IoT ALERT] Huge usage spike for ${resident.name}. Electricity: ${usage.electricityUsage.toFixed(1)} kWh, Water: ${usage.waterUsage.toFixed(1)} L`);
      logger.info(`[ACTION] Dispatched WhatsApp warning to ${resident.phone}`);
    }
  }

  return {
    metersScanned: residents.length,
    anomaliesDetected
  };
};
