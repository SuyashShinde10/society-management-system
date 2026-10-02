/**
 * Generates responsive, modern, professional HTML emails for society communications.
 * Fully compatible with Gmail, Apple Mail, Outlook, and mobile clients.
 */
const getProfessionalEmailTemplate = ({
  title = 'Awaastech Society',
  subtitle = 'SECURE DEPLOYMENT PROTOCOL',
  greeting = 'Hello,',
  bodyText,
  highlightBox = null,
  highlightBoxLabel = '',
  credentials = null, // { email, password, role? }
  actionButton = null, // { text, url }
  warningText = null,
  footerText = 'If you did not expect this email, please ignore it.'
}) => {
  // Auto-detect legacy credentials formatted inside highlightBox string (e.g. email<br><span>Pass: password</span>)
  let activeCredentials = credentials;
  if (!activeCredentials && typeof highlightBox === 'string' && (highlightBox.includes('Pass:') || highlightBox.includes('Pass :'))) {
    const emailMatch = highlightBox.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);
    const passMatch = highlightBox.match(/Pass\s*:\s*([^\s<]+)/i);

    if (emailMatch && passMatch) {
      activeCredentials = { email: emailMatch[0].trim(), password: passMatch[1].trim() };
    }
  }

  // Render Credentials Card
  let credentialsHtml = '';
  if (activeCredentials && activeCredentials.email) {
    credentialsHtml = `
      <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 22px 24px; margin: 24px 0; text-align: left; box-sizing: border-box;">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom: 14px; border-bottom: 1px solid #e2e8f0; padding-bottom: 10px;">
          <tr>
            <td style="font-size: 11px; font-weight: 700; color: #475569; text-transform: uppercase; letter-spacing: 0.08em;">
              <span style="display: inline-block; width: 8px; height: 8px; background-color: #10b981; border-radius: 50%; margin-right: 6px; vertical-align: middle;"></span>
              ${highlightBoxLabel || 'YOUR LOGIN CREDENTIALS'}
            </td>
            ${activeCredentials.role ? `<td align="right" style="font-size: 11px; font-weight: 600; color: #64748b; text-transform: uppercase; letter-spacing: 0.04em;">${activeCredentials.role}</td>` : ''}
          </tr>
        </table>

        <!-- Email Field -->
        <div style="margin-bottom: 14px;">
          <div style="font-size: 11px; font-weight: 700; color: #64748b; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 6px;">
            Login Email Address
          </div>
          <div style="background-color: #ffffff; border: 1px solid #cbd5e1; border-radius: 8px; padding: 10px 14px; font-size: 14px; font-weight: 600; color: #0f172a; word-break: break-all; overflow-wrap: anywhere; line-height: 1.4;">
            <a href="mailto:${activeCredentials.email}" style="color: #0f172a !important; text-decoration: none !important; font-weight: 600;">${activeCredentials.email}</a>
          </div>
        </div>

        <!-- Password Field -->
        <div>
          <div style="font-size: 11px; font-weight: 700; color: #64748b; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 6px;">
            Temporary Password
          </div>
          <div style="background-color: #ffffff; border: 1px dashed #94a3b8; border-radius: 8px; padding: 10px 14px; display: inline-block; width: 100%; box-sizing: border-box;">
            <span style="font-family: 'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, Courier, monospace; font-size: 16px; font-weight: 700; color: #0f172a; letter-spacing: 0.5px;">
              ${activeCredentials.password}
            </span>
          </div>
        </div>
      </div>
    `;
  }

  // Render Generic Highlight Box if not credentials
  let generalHighlightHtml = '';
  if (!activeCredentials && highlightBox) {
    const isOtp = typeof highlightBox === 'string' && /^\s*\d{4,8}\s*$/.test(highlightBox.trim());
    if (isOtp) {
      generalHighlightHtml = `
        <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 24px; text-align: center; margin: 24px 0;">
          ${highlightBoxLabel ? `<div style="font-size: 11px; font-weight: 700; color: #64748b; text-transform: uppercase; letter-spacing: 0.08em; margin-bottom: 12px;">${highlightBoxLabel}</div>` : ''}
          <div style="display: inline-block; background-color: #ffffff; border: 1px solid #cbd5e1; border-radius: 8px; padding: 12px 28px; font-family: 'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, Courier, monospace; font-size: 32px; font-weight: 800; color: #0f172a; letter-spacing: 6px;">
            ${highlightBox}
          </div>
        </div>
      `;
    } else {
      generalHighlightHtml = `
        <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 20px 24px; text-align: center; margin: 24px 0;">
          ${highlightBoxLabel ? `<div style="font-size: 11px; font-weight: 700; color: #64748b; text-transform: uppercase; letter-spacing: 0.08em; margin-bottom: 10px;">${highlightBoxLabel}</div>` : ''}
          <div style="font-size: 18px; font-weight: 700; color: #0f172a; line-height: 1.5; word-break: break-word; overflow-wrap: anywhere;">
            ${highlightBox}
          </div>
        </div>
      `;
    }
  }

  // Render Action Button if provided
  let actionButtonHtml = '';
  if (actionButton && actionButton.text && actionButton.url) {
    actionButtonHtml = `
      <div style="text-align: center; margin: 26px 0 20px 0;">
        <a href="${actionButton.url}" target="_blank" style="background-color: #0f172a; color: #ffffff !important; padding: 13px 30px; border-radius: 10px; font-weight: 600; font-size: 14px; text-decoration: none !important; display: inline-block; box-shadow: 0 4px 12px rgba(15, 23, 42, 0.15); letter-spacing: 0.02em;">
          ${actionButton.text} &rarr;
        </a>
      </div>
    `;
  }

  // Render Warning Banner if provided
  let warningHtml = '';
  if (warningText) {
    warningHtml = `
      <div style="background-color: #fffbeb; border: 1px solid #fde68a; border-left: 4px solid #f59e0b; border-radius: 8px; padding: 12px 16px; margin: 20px 0; text-align: left;">
        <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
          <tr>
            <td width="24" valign="top" style="font-size: 15px; line-height: 1.4; padding-right: 8px;">⚠️</td>
            <td style="font-size: 13px; color: #92400e; line-height: 1.5; font-weight: 500;">
              <strong style="color: #78350f;">Security Notice:</strong> ${warningText}
            </td>
          </tr>
        </table>
      </div>
    `;
  }

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f1f5f9; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; -webkit-font-smoothing: antialiased; -webkit-text-size-adjust: 100%;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #f1f5f9; padding: 36px 12px;">
    <tr>
      <td align="center">
        <!-- Main Email Container -->
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width: 560px; background-color: #ffffff; border-radius: 16px; border: 1px solid #e2e8f0; box-shadow: 0 4px 16px rgba(0,0,0,0.04); overflow: hidden; text-align: left;">
          
          <!-- Top Accent Banner -->
          <tr>
            <td style="background: linear-gradient(90deg, #0f172a 0%, #334155 50%, #c07858 100%); height: 5px; line-height: 5px; font-size: 5px;">&nbsp;</td>
          </tr>

          <!-- Inner Content Body -->
          <tr>
            <td style="padding: 32px 36px;">
              
              <!-- Header Section -->
              <div style="border-bottom: 1px solid #e2e8f0; padding-bottom: 18px; margin-bottom: 24px;">
                <div style="font-size: 21px; font-weight: 700; color: #0f172a; letter-spacing: -0.02em; margin-bottom: 6px;">
                  ${title}
                </div>
                ${subtitle ? `
                  <div style="display: inline-block; font-size: 11px; font-weight: 700; color: #64748b; background-color: #f1f5f9; padding: 3px 10px; border-radius: 20px; letter-spacing: 0.05em; text-transform: uppercase;">
                    ${subtitle}
                  </div>
                ` : ''}
              </div>

              <!-- Greeting -->
              ${greeting ? `
                <div style="font-size: 16px; font-weight: 600; color: #0f172a; margin-bottom: 14px;">
                  ${greeting}
                </div>
              ` : ''}

              <!-- Body Message -->
              <div style="font-size: 14px; color: #334155; line-height: 1.65; margin-bottom: 20px;">
                ${bodyText}
              </div>

              <!-- Credentials or Highlight Box -->
              ${credentialsHtml}
              ${generalHighlightHtml}

              <!-- Call to Action -->
              ${actionButtonHtml}

              <!-- Warning Banner -->
              ${warningHtml}

              <!-- Footer Section -->
              <div style="border-top: 1px solid #e2e8f0; margin-top: 30px; padding-top: 20px; text-align: center;">
                <p style="font-size: 12px; color: #64748b; margin: 0 0 6px 0; font-weight: 500;">
                  ${footerText}
                </p>
                <p style="font-size: 11px; color: #94a3b8; margin: 0;">
                  &copy; ${new Date().getFullYear()} Awaastech Solutions. All rights reserved.
                </p>
              </div>

            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();
};

module.exports = { getProfessionalEmailTemplate };
