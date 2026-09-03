/**
 * OpenAPI 3.0 Documentation Specification & HTML UI Renderer
 */

const openApiSpec = {
  openapi: '3.0.0',
  info: {
    title: 'Autonomous Smart Community ERP API',
    version: '1.0.0',
    description: 'Production API documentation for Autonomous Housing Society ERP Platform with AI dispute resolution, multi-tenant RBAC, billing, complaint tracking, escrow, and visitor management.',
  },
  servers: [
    {
      url: '/api',
      description: 'API Base Server',
    },
  ],
  components: {
    securitySchemes: {
      cookieAuth: {
        type: 'apiKey',
        in: 'cookie',
        name: 'token',
      },
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
      },
    },
  },
  paths: {
    '/auth/login': {
      post: {
        summary: 'Resident / Staff / Admin login',
        tags: ['Authentication'],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  email: { type: 'string', example: 'resident@test.com' },
                  password: { type: 'string', example: 'password123' },
                },
                required: ['email', 'password'],
              },
            },
          },
        },
        responses: {
          200: { description: 'Authenticated successfully with JWT cookie' },
          401: { description: 'Invalid credentials or inactive account' },
        },
      },
    },
    '/bills': {
      get: {
        summary: 'List maintenance bills (society admin or personal member bills)',
        tags: ['Billing & Maintenance'],
        responses: {
          200: { description: 'List of bills with pagination cursor' },
        },
      },
    },
    '/bills/generate': {
      post: {
        summary: 'Generate bulk or specific maintenance bills',
        tags: ['Billing & Maintenance'],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  title: { type: 'string', example: 'Monthly Society Maintenance - Oct' },
                  amount: { type: 'number', example: 2500 },
                  dueDate: { type: 'string', format: 'date' },
                  targetType: { type: 'string', enum: ['All', 'Specific'] },
                },
                required: ['title', 'amount'],
              },
            },
          },
        },
        responses: {
          201: { description: 'Bills generated successfully' },
        },
      },
    },
    '/complaints': {
      get: {
        summary: 'List complaints with filter and cursor pagination',
        tags: ['Complaints'],
        responses: {
          200: { description: 'List of complaints' },
        },
      },
      post: {
        summary: 'Lodge a new complaint',
        tags: ['Complaints'],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  title: { type: 'string' },
                  description: { type: 'string' },
                  priority: { type: 'string', enum: ['Low', 'Medium', 'High', 'Urgent'] },
                  category: { type: 'string', enum: ['Water', 'Electricity', 'Lift', 'Security', 'Cleanliness', 'Noise', 'Parking', 'Other'] },
                },
                required: ['title', 'description'],
              },
            },
          },
        },
        responses: {
          201: { description: 'Complaint filed successfully' },
        },
      },
    },
    '/visitors': {
      get: {
        summary: 'Retrieve visitor log records',
        tags: ['Visitor Security'],
        responses: {
          200: { description: 'Visitor logs' },
        },
      },
      post: {
        summary: 'Register new visitor check-in',
        tags: ['Visitor Security'],
        responses: {
          201: { description: 'Visitor registered successfully' },
        },
      },
    },
  },
};

const swaggerUiHtml = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Society ERP API Docs</title>
  <link rel="stylesheet" href="https://unpkg.com/swagger-ui-dist@5.11.0/swagger-ui.css" />
  <style>
    body { margin: 0; background: #fafafa; }
    .topbar { display: none !important; }
  </style>
</head>
<body>
  <div id="swagger-ui"></div>
  <script src="https://unpkg.com/swagger-ui-dist@5.11.0/swagger-ui-bundle.js" crossorigin></script>
  <script>
    window.onload = () => {
      window.ui = SwaggerUIBundle({
        spec: ${JSON.stringify(openApiSpec)},
        dom_id: '#swagger-ui',
        deepLinking: true,
        presets: [
          SwaggerUIBundle.presets.apis,
        ],
      });
    };
  </script>
</body>
</html>
`;

module.exports = {
  openApiSpec,
  swaggerUiHtml,
};
