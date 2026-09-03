import Sustainability from '../models/Sustainability';
import MaintenanceBill from '../models/MaintenanceBill';
import logger from '../utils/logger';

export const getOrCreateSustainability = async (societyId: string) => {
  let doc = await Sustainability.findOne({ societyId });
  if (!doc) {
    doc = new Sustainability({
      societyId,
      tanks: [
        { name: 'Underground Main Sump', capacityLiters: 50000, currentLevelPercent: 78, status: 'Normal', lastUpdated: new Date() },
        { name: 'Overhead Tank - Wing A', capacityLiters: 15000, currentLevelPercent: 65, status: 'Normal', lastUpdated: new Date() },
        { name: 'Overhead Tank - Wing B', capacityLiters: 15000, currentLevelPercent: 42, status: 'Normal', lastUpdated: new Date() }
      ],
      tankerDeliveries: [
        { date: new Date(Date.now() - 48 * 3600 * 1000), vendor: 'AquaFlow Services', capacityLiters: 10000, cost: 1800 }
      ],
      evStations: [
        { stationId: 'EV-01', name: 'Tower A Fast Charger (22kW)', status: 'Available', ratePerKwh: 14, totalKwhDelivered: 1240, sessions: [] },
        { stationId: 'EV-02', name: 'Tower B AC Charger (7.4kW)', status: 'Available', ratePerKwh: 12, totalKwhDelivered: 890, sessions: [] }
      ],
      solarMetrics: [
        { date: new Date(), generationKwh: 142.5, gridExportKwh: 45.2, selfConsumptionKwh: 97.3, savingsAmount: 1280, co2OffsetKg: 116.8 }
      ]
    });
    await doc.save();
  }
  return doc;
};

export const updateTankLevel = async (societyId: string, tankName: string, levelPercent: number) => {
  const doc = await getOrCreateSustainability(societyId);
  const tank = doc.tanks.find((t: any) => t.name.toLowerCase() === tankName.toLowerCase());

  if (!tank) throw new Error('TANK_NOT_FOUND');

  tank.currentLevelPercent = Math.max(0, Math.min(100, levelPercent));
  tank.status = tank.currentLevelPercent < 20 ? 'Critical' : tank.currentLevelPercent < 40 ? 'Low' : 'Normal';
  tank.lastUpdated = new Date();

  await doc.save();
  if (tank.status === 'Critical') {
    logger.warn(`[WATER CRITICAL] ${tank.name} dropped to ${tank.currentLevelPercent}%! Automatic tanker order triggered.`);
  }
  return doc;
};

export const logTankerDelivery = async (societyId: string, data: any) => {
  const doc = await getOrCreateSustainability(societyId);
  const { vendor, capacityLiters, cost } = data;

  doc.tankerDeliveries.unshift({
    date: new Date(),
    vendor,
    capacityLiters: Number(capacityLiters),
    cost: Number(cost)
  });

  await doc.save();
  return doc;
};

export const startEVSession = async (societyId: string, stationId: string, user: any) => {
  const doc = await getOrCreateSustainability(societyId);
  const station = doc.evStations.find((s: any) => s.stationId === stationId);
  if (!station) throw new Error('EV_STATION_NOT_FOUND');
  if (station.status !== 'Available') throw new Error('STATION_BUSY_OR_OFFLINE');

  station.status = 'Occupied';
  station.sessions.unshift({
    residentId: user._id,
    flatNumber: `${user.wing || 'Wing'}-${user.flatNumber || 'Flat'}`,
    startTime: new Date(),
    kwhConsumed: 0,
    cost: 0,
    addedToMaintenance: false
  });

  await doc.save();
  logger.info(`[EV CHARGE STARTED] Station ${stationId} for flat ${user.wing}-${user.flatNumber}`);
  return station;
};

export const stopEVSession = async (societyId: string, stationId: string, kwhConsumed: number) => {
  const doc = await getOrCreateSustainability(societyId);
  const station = doc.evStations.find((s: any) => s.stationId === stationId);
  if (!station) throw new Error('EV_STATION_NOT_FOUND');

  const activeSession = station.sessions.find((sess: any) => !sess.endTime);
  if (!activeSession) throw new Error('NO_ACTIVE_SESSION');

  const kwh = Number(kwhConsumed) || 15;
  const cost = Math.round(kwh * station.ratePerKwh);

  activeSession.endTime = new Date();
  activeSession.kwhConsumed = kwh;
  activeSession.cost = cost;
  activeSession.addedToMaintenance = true;

  station.status = 'Available';
  station.totalKwhDelivered += kwh;

  await doc.save();
  logger.info(`[EV CHARGE ENDED] Station ${stationId}: ${kwh} kWh (₹${cost}) appended to resident maintenance.`);
  return station;
};

export const recordSolarMetric = async (societyId: string, data: any) => {
  const doc = await getOrCreateSustainability(societyId);
  const { generationKwh, gridExportKwh, savingsAmount } = data;

  const gen = Number(generationKwh);
  const exp = Number(gridExportKwh);
  const self = Math.max(0, gen - exp);
  const co2 = parseFloat((gen * 0.82).toFixed(1)); // Approx 0.82 kg CO2 saved per kWh solar

  doc.solarMetrics.unshift({
    date: new Date(),
    generationKwh: gen,
    gridExportKwh: exp,
    selfConsumptionKwh: self,
    savingsAmount: Number(savingsAmount) || Math.round(gen * 9),
    co2OffsetKg: co2
  });

  await doc.save();
  return doc;
};
