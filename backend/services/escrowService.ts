import EscrowAccount from '../models/EscrowAccount';
import Society from '../models/Society';
import Project from '../models/Project';
import VendorQuote from '../models/VendorQuote';
import * as turf from '@turf/turf';
import withDistributedLock from '../utils/distributedLock';
import logger from '../utils/logger';
import { getProfessionalEmailTemplate } from '../utils/emailTemplates';
import { emailQueue } from '../workers/emailQueue';
import { IAuthUserContext } from '../types';

// ── Internal Types ──────────────────────────────────────────────────────────
interface ICreateEscrowData {
  projectId: import('mongoose').Types.ObjectId | string;
  vendorQuoteId: import('mongoose').Types.ObjectId | string;
  amount: number | string;
  societyId: string;
}

// ── Private Helpers ─────────────────────────────────────────────────────────

/**
 * Atomically release escrow funds once BOTH geofence and resident verifications pass.
 * Runs inside a distributed lock scoped to this escrow ID to prevent double-release.
 */
const checkAndReleaseFunds = async (escrow: any) => {
  return await withDistributedLock(`escrow:${escrow._id}`, 5000, async () => {
    if (escrow.geofenceVerified && escrow.residentVerified && escrow.status === 'Held') {
      const updated = await EscrowAccount.findOneAndUpdate(
        { _id: escrow._id, status: 'Held', geofenceVerified: true, residentVerified: true },
        { status: 'Released', releasedAt: new Date() },
        { returnDocument: 'after' }
      );
      if (updated) {
        escrow.status = 'Released';
        logger.info(`[ESCROW] Funds released for Escrow ID: ${escrow._id}`);
      }
    }
  });
};

// ── Public Service Functions ─────────────────────────────────────────────────

export const getAllEscrows = async (user: IAuthUserContext) => {
  const filter: Record<string, unknown> = {};
  if (user.role === 'admin') {
    if (!user.societyId) throw new Error('ADMIN_NO_SOCIETY');
    filter.societyId = user.societyId;
  }
  return await EscrowAccount.find(filter)
    .populate('projectId', 'title')
    .populate('vendorQuoteId', 'vendorName quoteAmount')
    .sort({ createdAt: -1 });
};

export const createEscrow = async (data: ICreateEscrowData, user: IAuthUserContext) => {
  const { projectId, vendorQuoteId, amount, societyId } = data;

  if (user.role !== 'superadmin' && user.societyId && user.societyId.toString() !== societyId) {
    throw new Error('NOT_AUTHORIZED_SOCIETY');
  }

  const escrow = new EscrowAccount({
    projectId,
    vendorQuoteId,
    societyId,
    amount,
    status: 'Held',
  });

  await escrow.save();

  // Send Work Order Approval & Escrow Funding Confirmation email to Vendor
  (async () => {
    try {
      const quote = await VendorQuote.findById(vendorQuoteId);
      const project = await Project.findById(projectId);
      if (quote) {
        quote.status = 'Selected';
        await quote.save();
      }

      if (quote && quote.vendorEmail) {
        const appUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
        const projectTitle = project?.title || 'Society Work Order';
        const workOrderHtml = getProfessionalEmailTemplate({
          title: 'Procurement & Escrow',
          subtitle: 'OFFICIAL WORK ORDER & ESCROW ALLOCATION',
          greeting: `Hello ${quote.vendorName},`,
          bodyText: `Congratulations! Your quotation for "<strong>${projectTitle}</strong>" has been officially approved by the society management committee.<br><br><strong>Project Title:</strong> ${projectTitle}<br><strong>Allocated Escrow Amount:</strong> ₹${amount}<br><strong>Agreed Timeline:</strong> ${quote.timeline || 'As per project schedule'}<br><br>The funds are now securely held in digital escrow and will be automatically disbursed upon geofence arrival check-in and committee verification of deliverables.`,
          highlightBox: `Escrow Secured: ₹${amount}`,
          highlightBoxLabel: `Status: Work Order Approved`,
          actionButton: {
            text: 'View Project Portal',
            url: `${appUrl}/login`
          },
          warningText: 'Work must strictly adhere to the approved project specifications and timeline.',
          footerText: 'Society Procurement & Vendor Management'
        });

        await emailQueue.add('sendEmailJob', {
          email: quote.vendorEmail,
          subject: `Work Order Approved: ${projectTitle} (₹${amount})`,
          html: workOrderHtml
        });
      }
    } catch (err: any) {
      logger.error('// VENDOR_WORK_ORDER_EMAIL_ERROR:', err.message);
    }
  })();

  return escrow;
};

export const verifyGeofence = async (
  escrowId: string,
  latitude: number,
  longitude: number,
) => {
  const escrow = await EscrowAccount.findById(escrowId);
  if (!escrow) throw new Error('ESCROW_NOT_FOUND');

  const society = await Society.findById(escrow.societyId);
  if (!society || !society.geoJSON || !society.geoJSON.coordinates) {
    throw new Error('GEOFENCE_NOT_CONFIGURED');
  }

  const pt = turf.point([longitude, latitude]);
  const poly = turf.polygon(society.geoJSON.coordinates as number[][][]);

  if (turf.booleanPointInPolygon(pt, poly)) {
    escrow.geofenceVerified = true;
    escrow.geofenceVerifiedAt = new Date();
    await escrow.save();

    await checkAndReleaseFunds(escrow);
    return escrow;
  } else {
    throw new Error('OUTSIDE_GEOFENCE');
  }
};

export const verifyResident = async (escrowId: string, user: IAuthUserContext) => {
  const escrow = await EscrowAccount.findById(escrowId);
  if (!escrow) throw new Error('ESCROW_NOT_FOUND');

  if (escrow.societyId.toString() !== user.societyId?.toString()) {
    throw new Error('NOT_AUTHORIZED_SOCIETY');
  }

  escrow.residentVerified = true;
  escrow.residentVerifiedAt = new Date();
  escrow.residentId = user._id as import('mongoose').Types.ObjectId;
  await escrow.save();

  await checkAndReleaseFunds(escrow);
  return escrow;
};
