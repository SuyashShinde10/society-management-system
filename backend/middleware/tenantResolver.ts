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
 */
export const tenantResolver = async (req: TenantRequest, res: any, next: any) => {
  try {
    const host = String((typeof req.get === 'function' ? req.get('host') : req.headers?.host) || '');
    const customTenantHeader = String((typeof req.get === 'function' ? req.get('x-tenant-slug') : req.headers?.['x-tenant-slug']) || '');

    // Extract subdomain if host is e.g. "skyline.awaas.com" or "localhost:5000"
    const hostParts = host.split(':')[0].split('.');
    let slug = customTenantHeader;


    if (!slug && hostParts.length >= 3) {
      // Subdomain exists (e.g., [subdomain].domain.com)
      slug = hostParts[0].toLowerCase();
    }

    if (slug && slug !== 'www' && slug !== 'api') {
      const society = await Society.findOne({
        $or: [
          { name: { $regex: new RegExp(`^${slug}$`, 'i') } },
          { _id: slug.match(/^[0-9a-fA-F]{24}$/) ? slug : null }
        ]
      });

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
