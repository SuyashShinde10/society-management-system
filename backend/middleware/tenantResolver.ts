import Society from '../models/Society';
import logger from '../utils/logger';

export interface TenantRequest {
  headers: Record<string, string | string[] | undefined>;
  get?(header: string): string | undefined;
  tenantSociety?: any;
  [key: string]: any;
}

/**
 * Tenant resolution middleware:
 * Parses subdomains (e.g. greenacres.awaas.com or custom headers)
 * and resolves the tenant Society document.
 *
 * Resolution order:
 *  1. x-tenant-slug header (explicit override)
 *  2. Subdomain extracted from Host header
 *
 * SECURITY: Uses indexed `slug` field (not regex on name) to prevent ReDoS.
 */
export const tenantResolver = async (req: TenantRequest, res: any, next: any) => {
  try {
    const host = String((typeof req.get === 'function' ? req.get('host') : req.headers?.host) || '');
    const customTenantHeader = String((typeof req.get === 'function' ? req.get('x-tenant-slug') : req.headers?.['x-tenant-slug']) || '');

    // Extract subdomain if host is e.g. "skyline.awaas.com"
    const hostParts = host.split(':')[0].split('.');
    let slug = customTenantHeader.toLowerCase().trim();

    if (!slug && hostParts.length >= 3) {
      slug = hostParts[0].toLowerCase();
    }

    if (slug && slug !== 'www' && slug !== 'api' && slug !== 'localhost') {
      const society = await Society.findOne(
        slug.match(/^[0-9a-fA-F]{24}$/)
          ? { _id: slug }                 // ObjectId-based lookup (admin use case)
          : { slug: slug }                // ← indexed slug field — fast and safe
      );

      if (society) {
        req.tenantSociety = society;
      }
    }

    next();
  } catch (err) {
    logger.warn('Tenant resolution error (proceeding as default):', err);
    next();
  }
};
