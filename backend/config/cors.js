// CORS Configuration for multiple domains
// This file can be customized for different environments

const corsConfig = {
  // Development origins (always allowed)
  development: [
    'http://localhost:3000',
    'http://127.0.0.1:3000',
    'http://localhost:3001',
    'http://127.0.0.1:3001',
    'http://localhost:8080',
    'http://127.0.0.1:8080'
  ],

  // Production origins (add your actual domains)
  production: [
    'https://sahayak.com',
    'https://www.sahayak.com',
    'https://app.sahayak.com',
    'https://sahayak-ai.com',
    'https://www.sahayak-ai.com',
    'https://edu-sahayak.com',
    'https://www.edu-sahayak.com',
    'https://yourdomain.com',
    'https://www.yourdomain.com',
    'https://app.yourdomain.com'
  ],

  // Staging/Testing origins
  staging: [
    'https://staging.sahayak.com',
    'https://test.sahayak.com',
    'https://dev.sahayak.com',
    'https://staging.yourdomain.com',
    'https://test.yourdomain.com'
  ],

  // Additional custom domains (add as needed)
  custom: [
    // Add your custom domains here
    'https://custom-domain.com',
    'https://www.custom-domain.com'
  ]
};

// Function to get allowed origins based on environment
function getAllowedOrigins() {
  const env = process.env.NODE_ENV || 'development';
  const customOrigins = process.env.CORS_ORIGINS ? process.env.CORS_ORIGINS.split(',') : [];
  
  let origins = [...corsConfig.development]; // Always include development origins
  
  if (env === 'production') {
    origins = [...origins, ...corsConfig.production];
  } else if (env === 'staging') {
    origins = [...origins, ...corsConfig.staging];
  }
  
  // Add custom origins from environment variable
  origins = [...origins, ...corsConfig.custom, ...customOrigins];
  
  // Remove duplicates
  return [...new Set(origins)];
}

// CORS options configuration
const corsOptions = {
  origin: function (origin, callback) {
    const allowedOrigins = getAllowedOrigins();
    
    // Allow requests with no origin (like mobile apps or Postman)
    if (!origin) {
      console.log('CORS: Allowing request with no origin');
      return callback(null, true);
    }
    
    // Check if origin is in allowed list
    if (allowedOrigins.includes(origin)) {
      console.log(`CORS: Allowing origin: ${origin}`);
      callback(null, true);
    } else {
      console.log(`CORS: Blocked origin: ${origin}`);
      console.log(`CORS: Allowed origins: ${allowedOrigins.join(', ')}`);
      callback(new Error(`Origin ${origin} not allowed by CORS`));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: [
    'Content-Type', 
    'Authorization', 
    'X-Requested-With', 
    'Accept',
    'Origin',
    'Cache-Control',
    'X-File-Name'
  ],
  exposedHeaders: [
    'Content-Length', 
    'X-Requested-With',
    'X-Total-Count',
    'X-Page-Count'
  ],
  maxAge: 86400, // 24 hours
  preflightContinue: false,
  optionsSuccessStatus: 204
};

// Function to add a new domain
function addDomain(domain) {
  if (!corsConfig.custom.includes(domain)) {
    corsConfig.custom.push(domain);
    console.log(`Added domain to CORS: ${domain}`);
  }
}

// Function to remove a domain
function removeDomain(domain) {
  const index = corsConfig.custom.indexOf(domain);
  if (index > -1) {
    corsConfig.custom.splice(index, 1);
    console.log(`Removed domain from CORS: ${domain}`);
  }
}

// Function to list all allowed origins
function listAllowedOrigins() {
  const origins = getAllowedOrigins();
  console.log('Currently allowed CORS origins:');
  origins.forEach((origin, index) => {
    console.log(`${index + 1}. ${origin}`);
  });
  return origins;
}

module.exports = {
  corsOptions,
  getAllowedOrigins,
  addDomain,
  removeDomain,
  listAllowedOrigins,
  corsConfig
}; 