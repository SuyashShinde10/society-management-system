const getProfessionalEmailTemplate = ({
  title = 'Awaastech Society',
  subtitle = 'SECURE DEPLOYMENT PROTOCOL',
  greeting = 'Hello,',
  bodyText,
  highlightBox = null,
  highlightBoxLabel = '',
  warningText = null,
  footerText = 'If you did not expect this email, please ignore it.'
}) => {
  return `
    <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 500px; margin: 0 auto; padding: 30px; border: 1px solid #eaeaea; border-radius: 12px; box-shadow: 0 4px 10px rgba(0,0,0,0.05);">
      <div style="text-align: center; border-bottom: 2px solid #2563eb; padding-bottom: 15px; margin-bottom: 25px;">
        <h1 style="color: #1a1a1a; margin: 0; font-size: 24px; text-transform: uppercase; letter-spacing: 1px;">${title}</h1>
        <p style="color: #64748b; font-size: 12px; margin-top: 5px; font-family: monospace;">${subtitle}</p>
      </div>
      
      ${greeting ? `<p style="font-size: 16px; color: #333; line-height: 1.5; text-align: center;">${greeting}</p>` : ''}
      
      <div style="font-size: 15px; color: #475569; line-height: 1.6; text-align: center; margin-bottom: 20px;">
        ${bodyText}
      </div>
      
      ${highlightBox ? `
      <div style="background-color: #f8fafc; padding: 25px; border-radius: 8px; text-align: center; margin: 30px 0;">
        ${highlightBoxLabel ? `<p style="font-size: 13px; font-weight: bold; color: #94a3b8; text-transform: uppercase; margin-bottom: 10px; margin-top: 0;">${highlightBoxLabel}</p>` : ''}
        <div style="font-size: 30px; font-weight: 800; color: #2563eb; letter-spacing: 2px; font-family: monospace;">
          ${highlightBox}
        </div>
      </div>
      ` : ''}
      
      ${warningText ? `<p style="font-size: 13px; color: #ef4444; text-align: center; font-weight: bold;">⚠️ ${warningText}</p>` : ''}
      
      <div style="border-top: 1px solid #eaeaea; margin-top: 30px; padding-top: 20px; text-align: center;">
        <p style="font-size: 11px; color: #94a3b8; margin: 0;">${footerText}</p>
        <p style="font-size: 11px; color: #94a3b8; margin: 5px 0 0 0;">&copy; ${new Date().getFullYear()} Awaastech Solutions. All rights reserved.</p>
      </div>
    </div>
  `;
};

module.exports = { getProfessionalEmailTemplate };
