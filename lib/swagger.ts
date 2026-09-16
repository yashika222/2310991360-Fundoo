export const openapiSpec = {
  openapi: '3.0.0',
  info: { title: 'FundooNotes API', version: '1.0.0' },
  servers: [{ url: 'http://127.0.0.1:3000' }],
  components: {
    securitySchemes: { bearerAuth: { type: 'http', scheme: 'bearer' } },
  },
  paths: {
    '/api/health': { get: { summary: 'Health', responses: { 200: { description: 'OK' } } } },
    '/api/auth/register': { post: { summary: 'Register', responses: { 201: { description: 'Created' } } } },
    '/api/auth/login': { post: { summary: 'Login', responses: { 200: { description: 'JWT' } } } },
    '/api/auth/logout': { post: { summary: 'Logout', responses: { 200: { description: 'OK' } } } },
    '/api/auth/forgot-password': { post: { summary: 'Forgot password', responses: { 200: { description: 'OK' } } } },
    '/api/auth/reset-password': { post: { summary: 'Reset password', responses: { 200: { description: 'OK' } } } },
    '/api/notes': {
      get: {
        summary: 'List notes (page, limit, archived=true, label)',
        security: [{ bearerAuth: [] }],
        responses: { 200: { description: 'Paged notes' } },
      },
      post: { summary: 'Create note', security: [{ bearerAuth: [] }], responses: { 201: { description: 'Created' } } },
    },
    '/api/notes/{id}': {
      get: { summary: 'Get note', security: [{ bearerAuth: [] }], responses: { 200: { description: 'Note' } } },
      put: { summary: 'Update note', security: [{ bearerAuth: [] }], responses: { 200: { description: 'Updated' } } },
      delete: { summary: 'Trash (delete both DBs)', security: [{ bearerAuth: [] }], responses: { 200: { description: 'Deleted' } } },
    },
    '/api/notes/{id}/archive': {
      patch: { summary: 'Move note to archive database', security: [{ bearerAuth: [] }], responses: { 200: { description: 'Archived' } } },
    },
    '/api/notes/{id}/restore': {
      patch: { summary: 'Move note back to main database', security: [{ bearerAuth: [] }], responses: { 200: { description: 'Restored' } } },
    },
    '/api/notes/{id}/trash': {
      patch: { summary: 'Delete from main and archive databases', security: [{ bearerAuth: [] }], responses: { 200: { description: 'Deleted' } } },
    },
  },
};
