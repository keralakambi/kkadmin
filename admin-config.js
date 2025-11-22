// KK Admin Configuration
export const adminConfig = {
    // System Settings
    system: {
        maintenanceMode: false,
        realTimeUpdates: true,
        autoBackup: true,
        backupInterval: 24, // hours
        maxBackups: 10,
        cacheTimeout: 3600, // seconds
        sessionTimeout: 7200, // seconds
    },

    // Security Settings
    security: {
        maxLoginAttempts: 5,
        lockoutDuration: 900, // seconds
        passwordMinLength: 8,
        requireSpecialChars: true,
        sessionEncryption: true,
        ipWhitelist: [],
        twoFactorAuth: false,
    },

    // Website Management
    websites: {
        kkpolls: {
            name: 'KK Polls',
            url: '../kkpoll/',
            status: 'active',
            features: ['polls', 'voting', 'results'],
            permissions: ['create', 'read', 'update', 'delete'],
            analytics: true,
            backup: true,
        },
        kknews: {
            name: 'KK News',
            url: '../kknews/',
            status: 'active',
            features: ['articles', 'categories', 'comments'],
            permissions: ['create', 'read', 'update', 'delete'],
            analytics: true,
            backup: true,
        },
        kkmodels: {
            name: 'KK Models',
            url: '../kkmodels/',
            status: 'active',
            features: ['profiles', 'galleries', 'followers'],
            permissions: ['create', 'read', 'update', 'delete'],
            analytics: true,
            backup: true,
        },
        kkrequest: {
            name: 'KK Request',
            url: '../kkrequest/',
            status: 'active',
            features: ['requests', 'tracking', 'responses'],
            permissions: ['create', 'read', 'update', 'delete'],
            analytics: true,
            backup: true,
        },
    },

    // Database Collections
    collections: {
        polls: {
            name: 'Polls',
            fields: ['question', 'options', 'totalVotes', 'isActive', 'createdAt', 'updatedAt'],
            indexes: ['createdAt', 'isActive'],
            backup: true,
        },
        news: {
            name: 'News Articles',
            fields: ['title', 'content', 'category', 'image', 'views', 'createdAt', 'updatedAt'],
            indexes: ['category', 'createdAt', 'views'],
            backup: true,
        },
        models: {
            name: 'Models',
            fields: ['name', 'age', 'country', 'bio', 'image', 'followers', 'verified', 'createdAt'],
            indexes: ['name', 'country', 'followers'],
            backup: true,
        },
        requests: {
            name: 'Requests',
            fields: ['title', 'description', 'platform', 'status', 'priority', 'createdAt', 'updatedAt'],
            indexes: ['status', 'priority', 'platform'],
            backup: true,
        },
        users: {
            name: 'Users',
            fields: ['username', 'email', 'status', 'role', 'lastLogin', 'createdAt'],
            indexes: ['username', 'email', 'status'],
            backup: true,
        },
        activity_logs: {
            name: 'Activity Logs',
            fields: ['type', 'description', 'userId', 'metadata', 'createdAt'],
            indexes: ['type', 'createdAt', 'userId'],
            backup: false,
        },
        backups: {
            name: 'Backups',
            fields: ['name', 'size', 'collections', 'status', 'createdAt'],
            indexes: ['createdAt', 'status'],
            backup: false,
        },
    },

    // User Roles and Permissions
    roles: {
        superadmin: {
            name: 'Super Administrator',
            permissions: ['*'],
            description: 'Full system access',
        },
        admin: {
            name: 'Administrator',
            permissions: [
                'polls:*', 'news:*', 'models:*', 'requests:*',
                'users:read', 'users:update', 'analytics:read',
                'settings:read', 'backup:create', 'backup:restore'
            ],
            description: 'Website management access',
        },
        moderator: {
            name: 'Moderator',
            permissions: [
                'polls:read', 'polls:update',
                'news:read', 'news:update',
                'models:read', 'models:update',
                'requests:read', 'requests:update',
                'users:read'
            ],
            description: 'Content moderation access',
        },
        editor: {
            name: 'Editor',
            permissions: [
                'news:create', 'news:read', 'news:update',
                'models:create', 'models:read', 'models:update'
            ],
            description: 'Content creation and editing',
        },
    },

    // Analytics Configuration
    analytics: {
        trackingEnabled: true,
        realTimeStats: true,
        retentionDays: 90,
        metrics: [
            'page_views', 'unique_visitors', 'bounce_rate',
            'session_duration', 'conversion_rate', 'user_engagement'
        ],
        reports: {
            daily: true,
            weekly: true,
            monthly: true,
            custom: true,
        },
    },

    // Notification Settings
    notifications: {
        email: {
            enabled: true,
            smtp: {
                host: 'smtp.gmail.com',
                port: 587,
                secure: false,
                auth: {
                    user: 'admin@kk-ecosystem.com',
                    pass: 'your-app-password'
                }
            },
            templates: {
                backup_complete: 'Backup completed successfully',
                system_error: 'System error detected',
                maintenance_mode: 'Maintenance mode activated',
                user_registration: 'New user registered',
            }
        },
        push: {
            enabled: false,
            vapidKeys: {
                publicKey: '',
                privateKey: ''
            }
        },
        slack: {
            enabled: false,
            webhook: '',
            channels: {
                alerts: '#alerts',
                backups: '#backups',
                users: '#users'
            }
        }
    },

    // API Configuration
    api: {
        rateLimit: {
            windowMs: 900000, // 15 minutes
            max: 100, // requests per window
        },
        cors: {
            origin: ['http://localhost:3000', 'https://kk-ecosystem.com'],
            credentials: true,
        },
        authentication: {
            jwtSecret: 'your-jwt-secret-key',
            tokenExpiry: '24h',
            refreshTokenExpiry: '7d',
        }
    },

    // Content Management
    content: {
        imageUpload: {
            maxSize: 5242880, // 5MB
            allowedTypes: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
            storage: 'firebase', // or 'local', 's3', 'cloudinary'
        },
        textEditor: {
            toolbar: ['bold', 'italic', 'underline', 'link', 'image', 'list'],
            maxLength: 10000,
            allowHtml: false,
        },
        moderation: {
            autoModeration: true,
            profanityFilter: true,
            spamDetection: true,
            imageModeration: false,
        }
    },

    // Performance Settings
    performance: {
        caching: {
            enabled: true,
            strategy: 'lru', // least recently used
            maxSize: 100, // MB
            ttl: 3600, // seconds
        },
        compression: {
            enabled: true,
            level: 6, // 1-9
            threshold: 1024, // bytes
        },
        cdn: {
            enabled: false,
            provider: 'cloudflare',
            baseUrl: '',
        }
    },

    // Monitoring and Logging
    monitoring: {
        errorTracking: {
            enabled: true,
            service: 'sentry',
            dsn: '',
        },
        performance: {
            enabled: true,
            sampleRate: 0.1,
        },
        uptime: {
            enabled: true,
            interval: 60000, // ms
            endpoints: [
                '/health',
                '/api/status',
            ]
        },
        logging: {
            level: 'info', // error, warn, info, debug
            format: 'json',
            rotation: {
                enabled: true,
                maxFiles: 10,
                maxSize: '10m',
            }
        }
    },

    // Backup Configuration
    backup: {
        automatic: {
            enabled: true,
            schedule: '0 2 * * *', // daily at 2 AM
            retention: 30, // days
        },
        storage: {
            local: true,
            cloud: false,
            provider: 'firebase', // or 's3', 'gcs'
        },
        compression: true,
        encryption: false,
        verification: true,
    },

    // Feature Flags
    features: {
        darkMode: true,
        realTimeChat: false,
        advancedAnalytics: true,
        bulkOperations: true,
        apiAccess: true,
        webhooks: false,
        customThemes: false,
        multiLanguage: false,
        socialLogin: false,
        twoFactorAuth: false,
    },

    // UI Customization
    ui: {
        theme: {
            primary: '#e91e63',
            secondary: '#ad1457',
            background: 'linear-gradient(135deg, #1a1a1a 0%, #2d1b2e 100%)',
            text: '#ffffff',
            accent: '#4caf50',
        },
        layout: {
            sidebar: 'left',
            navigation: 'top',
            density: 'comfortable', // compact, comfortable, spacious
        },
        branding: {
            logo: 'https://keralakambi.ct.ws/assets/favicon-32x32.png',
            title: 'KK Admin Panel',
            favicon: 'https://keralakambi.ct.ws/assets/favicon.ico',
        }
    }
};

// Configuration validation
export function validateConfig(config) {
    const errors = [];
    
    // Validate required fields
    if (!config.system) errors.push('System configuration is required');
    if (!config.security) errors.push('Security configuration is required');
    if (!config.websites) errors.push('Websites configuration is required');
    
    // Validate security settings
    if (config.security.passwordMinLength < 6) {
        errors.push('Password minimum length should be at least 6 characters');
    }
    
    // Validate backup settings
    if (config.backup.automatic.enabled && !config.backup.automatic.schedule) {
        errors.push('Backup schedule is required when automatic backup is enabled');
    }
    
    return {
        isValid: errors.length === 0,
        errors
    };
}

// Get configuration value with fallback
export function getConfig(path, fallback = null) {
    const keys = path.split('.');
    let value = adminConfig;
    
    for (const key of keys) {
        if (value && typeof value === 'object' && key in value) {
            value = value[key];
        } else {
            return fallback;
        }
    }
    
    return value;
}

// Update configuration value
export function setConfig(path, value) {
    const keys = path.split('.');
    const lastKey = keys.pop();
    let target = adminConfig;
    
    for (const key of keys) {
        if (!(key in target)) {
            target[key] = {};
        }
        target = target[key];
    }
    
    target[lastKey] = value;
    
    // Save to localStorage for persistence
    localStorage.setItem('kkAdminConfig', JSON.stringify(adminConfig));
}

// Load configuration from localStorage
export function loadConfig() {
    try {
        const saved = localStorage.getItem('kkAdminConfig');
        if (saved) {
            const parsedConfig = JSON.parse(saved);
            Object.assign(adminConfig, parsedConfig);
        }
    } catch (error) {
        console.error('Error loading configuration:', error);
    }
}

// Initialize configuration
loadConfig();

export default adminConfig;