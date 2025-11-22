// System Monitoring and Health Check Module
import { dbOperations } from './firebase-config.js';
import { adminConfig, getConfig } from './admin-config.js';

class SystemMonitor {
    constructor() {
        this.isMonitoring = false;
        this.healthStatus = {
            overall: 'healthy',
            database: 'unknown',
            storage: 'unknown',
            performance: 'unknown',
            security: 'unknown',
            lastCheck: null
        };
        this.metrics = {
            responseTime: [],
            errorRate: 0,
            uptime: 0,
            memoryUsage: 0,
            activeUsers: 0,
            requestsPerMinute: 0
        };
        this.alerts = [];
        this.startTime = Date.now();
    }

    // Start system monitoring
    startMonitoring() {
        if (this.isMonitoring) return;
        
        this.isMonitoring = true;
        console.log('🔍 System monitoring started');
        
        // Run initial health check
        this.performHealthCheck();
        
        // Set up periodic monitoring
        this.monitoringInterval = setInterval(() => {
            this.performHealthCheck();
            this.collectMetrics();
            this.checkAlerts();
        }, getConfig('monitoring.uptime.interval', 60000));
        
        // Set up performance monitoring
        this.performanceInterval = setInterval(() => {
            this.monitorPerformance();
        }, 30000);
    }

    // Stop system monitoring
    stopMonitoring() {
        if (!this.isMonitoring) return;
        
        this.isMonitoring = false;
        console.log('⏹️ System monitoring stopped');
        
        if (this.monitoringInterval) {
            clearInterval(this.monitoringInterval);
        }
        if (this.performanceInterval) {
            clearInterval(this.performanceInterval);
        }
    }

    // Perform comprehensive health check
    async performHealthCheck() {
        const startTime = performance.now();
        
        try {
            // Check database connectivity
            const dbHealth = await this.checkDatabaseHealth();
            
            // Check storage health
            const storageHealth = await this.checkStorageHealth();
            
            // Check performance metrics
            const performanceHealth = this.checkPerformanceHealth();
            
            // Check security status
            const securityHealth = this.checkSecurityHealth();
            
            // Calculate overall health
            const overallHealth = this.calculateOverallHealth([
                dbHealth, storageHealth, performanceHealth, securityHealth
            ]);
            
            this.healthStatus = {
                overall: overallHealth,
                database: dbHealth,
                storage: storageHealth,
                performance: performanceHealth,
                security: securityHealth,
                lastCheck: new Date().toISOString(),
                responseTime: performance.now() - startTime
            };
            
            // Log health status
            this.logHealthStatus();
            
        } catch (error) {
            console.error('Health check failed:', error);
            this.healthStatus.overall = 'critical';
            this.addAlert('critical', 'Health check failed', error.message);
        }
    }

    // Check database health
    async checkDatabaseHealth() {
        try {
            const startTime = performance.now();
            
            // Test database connectivity
            await dbOperations.getAll('polls');
            
            const responseTime = performance.now() - startTime;
            
            if (responseTime > 5000) {
                this.addAlert('warning', 'Database slow response', `Response time: ${responseTime}ms`);
                return 'warning';
            } else if (responseTime > 10000) {
                this.addAlert('critical', 'Database very slow', `Response time: ${responseTime}ms`);
                return 'critical';
            }
            
            return 'healthy';
        } catch (error) {
            this.addAlert('critical', 'Database connection failed', error.message);
            return 'critical';
        }
    }

    // Check storage health
    async checkStorageHealth() {
        try {
            // Check localStorage availability
            const testKey = 'health_check_test';
            localStorage.setItem(testKey, 'test');
            localStorage.removeItem(testKey);
            
            // Check storage quota
            if ('storage' in navigator && 'estimate' in navigator.storage) {
                const estimate = await navigator.storage.estimate();
                const usagePercentage = (estimate.usage / estimate.quota) * 100;
                
                if (usagePercentage > 90) {
                    this.addAlert('critical', 'Storage almost full', `Usage: ${usagePercentage.toFixed(1)}%`);
                    return 'critical';
                } else if (usagePercentage > 75) {
                    this.addAlert('warning', 'Storage usage high', `Usage: ${usagePercentage.toFixed(1)}%`);
                    return 'warning';
                }
            }
            
            return 'healthy';
        } catch (error) {
            this.addAlert('warning', 'Storage check failed', error.message);
            return 'warning';
        }
    }

    // Check performance health
    checkPerformanceHealth() {
        try {
            // Check memory usage (if available)
            if ('memory' in performance) {
                const memInfo = performance.memory;
                const usagePercentage = (memInfo.usedJSHeapSize / memInfo.jsHeapSizeLimit) * 100;
                
                this.metrics.memoryUsage = usagePercentage;
                
                if (usagePercentage > 90) {
                    this.addAlert('critical', 'High memory usage', `Usage: ${usagePercentage.toFixed(1)}%`);
                    return 'critical';
                } else if (usagePercentage > 75) {
                    this.addAlert('warning', 'Memory usage high', `Usage: ${usagePercentage.toFixed(1)}%`);
                    return 'warning';
                }
            }
            
            // Check response times
            const avgResponseTime = this.getAverageResponseTime();
            if (avgResponseTime > 3000) {
                this.addAlert('warning', 'Slow response times', `Average: ${avgResponseTime}ms`);
                return 'warning';
            }
            
            return 'healthy';
        } catch (error) {
            console.error('Performance check failed:', error);
            return 'warning';
        }
    }

    // Check security health
    checkSecurityHealth() {
        try {
            const issues = [];
            
            // Check if HTTPS is being used
            if (location.protocol !== 'https:' && location.hostname !== 'localhost') {
                issues.push('Not using HTTPS');
            }
            
            // Check session security
            const sessionTimeout = getConfig('system.sessionTimeout', 7200);
            if (sessionTimeout > 86400) { // 24 hours
                issues.push('Session timeout too long');
            }
            
            // Check password policy
            const minLength = getConfig('security.passwordMinLength', 8);
            if (minLength < 8) {
                issues.push('Weak password policy');
            }
            
            // Check for maintenance mode
            if (getConfig('system.maintenanceMode', false)) {
                issues.push('System in maintenance mode');
            }
            
            if (issues.length > 2) {
                this.addAlert('critical', 'Multiple security issues', issues.join(', '));
                return 'critical';
            } else if (issues.length > 0) {
                this.addAlert('warning', 'Security issues detected', issues.join(', '));
                return 'warning';
            }
            
            return 'healthy';
        } catch (error) {
            console.error('Security check failed:', error);
            return 'warning';
        }
    }

    // Calculate overall health status
    calculateOverallHealth(healthChecks) {
        const criticalCount = healthChecks.filter(h => h === 'critical').length;
        const warningCount = healthChecks.filter(h => h === 'warning').length;
        
        if (criticalCount > 0) return 'critical';
        if (warningCount > 1) return 'warning';
        if (warningCount > 0) return 'degraded';
        return 'healthy';
    }

    // Collect system metrics
    async collectMetrics() {
        try {
            // Update uptime
            this.metrics.uptime = Date.now() - this.startTime;
            
            // Collect active users (mock data for now)
            this.metrics.activeUsers = await this.getActiveUsersCount();
            
            // Update requests per minute (mock data)
            this.metrics.requestsPerMinute = Math.floor(Math.random() * 100) + 50;
            
        } catch (error) {
            console.error('Error collecting metrics:', error);
        }
    }

    // Monitor performance metrics
    monitorPerformance() {
        try {
            // Measure page load performance
            if ('getEntriesByType' in performance) {
                const navigationEntries = performance.getEntriesByType('navigation');
                if (navigationEntries.length > 0) {
                    const entry = navigationEntries[0];
                    const loadTime = entry.loadEventEnd - entry.loadEventStart;
                    
                    this.metrics.responseTime.push(loadTime);
                    
                    // Keep only last 10 measurements
                    if (this.metrics.responseTime.length > 10) {
                        this.metrics.responseTime.shift();
                    }
                }
            }
            
            // Monitor error rate
            this.updateErrorRate();
            
        } catch (error) {
            console.error('Performance monitoring failed:', error);
        }
    }

    // Check for alerts and notifications
    checkAlerts() {
        // Remove old alerts (older than 1 hour)
        const oneHourAgo = Date.now() - (60 * 60 * 1000);
        this.alerts = this.alerts.filter(alert => alert.timestamp > oneHourAgo);
        
        // Check for critical alerts
        const criticalAlerts = this.alerts.filter(alert => alert.level === 'critical');
        if (criticalAlerts.length > 0) {
            this.sendNotifications(criticalAlerts);
        }
    }

    // Add alert
    addAlert(level, title, message) {
        const alert = {
            id: Date.now() + Math.random(),
            level,
            title,
            message,
            timestamp: Date.now(),
            acknowledged: false
        };
        
        this.alerts.unshift(alert);
        
        // Keep only last 50 alerts
        if (this.alerts.length > 50) {
            this.alerts = this.alerts.slice(0, 50);
        }
        
        console.log(`🚨 ${level.toUpperCase()}: ${title} - ${message}`);
    }

    // Get active users count
    async getActiveUsersCount() {
        try {
            // This would typically query active sessions
            // For now, return a mock value
            return Math.floor(Math.random() * 50) + 10;
        } catch (error) {
            return 0;
        }
    }

    // Get average response time
    getAverageResponseTime() {
        if (this.metrics.responseTime.length === 0) return 0;
        
        const sum = this.metrics.responseTime.reduce((a, b) => a + b, 0);
        return sum / this.metrics.responseTime.length;
    }

    // Update error rate
    updateErrorRate() {
        // This would typically track actual errors
        // For now, simulate error rate
        this.metrics.errorRate = Math.random() * 5; // 0-5% error rate
    }

    // Send notifications for critical alerts
    sendNotifications(alerts) {
        if (!getConfig('notifications.email.enabled', false)) return;
        
        // This would integrate with actual notification service
        console.log('📧 Sending notifications for critical alerts:', alerts);
    }

    // Log health status
    logHealthStatus() {
        const status = this.healthStatus.overall;
        const emoji = {
            'healthy': '✅',
            'degraded': '⚠️',
            'warning': '🟡',
            'critical': '🔴'
        };
        
        console.log(`${emoji[status]} System Health: ${status.toUpperCase()}`);
    }

    // Get system status report
    getStatusReport() {
        return {
            health: this.healthStatus,
            metrics: {
                ...this.metrics,
                averageResponseTime: this.getAverageResponseTime(),
                uptimeFormatted: this.formatUptime(this.metrics.uptime)
            },
            alerts: this.alerts.slice(0, 10), // Last 10 alerts
            isMonitoring: this.isMonitoring
        };
    }

    // Format uptime duration
    formatUptime(milliseconds) {
        const seconds = Math.floor(milliseconds / 1000);
        const minutes = Math.floor(seconds / 60);
        const hours = Math.floor(minutes / 60);
        const days = Math.floor(hours / 24);
        
        if (days > 0) return `${days}d ${hours % 24}h ${minutes % 60}m`;
        if (hours > 0) return `${hours}h ${minutes % 60}m`;
        if (minutes > 0) return `${minutes}m ${seconds % 60}s`;
        return `${seconds}s`;
    }

    // Acknowledge alert
    acknowledgeAlert(alertId) {
        const alert = this.alerts.find(a => a.id === alertId);
        if (alert) {
            alert.acknowledged = true;
        }
    }

    // Clear all alerts
    clearAlerts() {
        this.alerts = [];
    }

    // Export metrics for analysis
    exportMetrics() {
        return {
            timestamp: new Date().toISOString(),
            health: this.healthStatus,
            metrics: this.metrics,
            alerts: this.alerts,
            config: {
                monitoringEnabled: this.isMonitoring,
                checkInterval: getConfig('monitoring.uptime.interval', 60000),
                retentionDays: getConfig('analytics.retentionDays', 90)
            }
        };
    }
}

// Create global system monitor instance
export const systemMonitor = new SystemMonitor();

// Auto-start monitoring if enabled
if (getConfig('monitoring.enabled', true)) {
    systemMonitor.startMonitoring();
}

export default SystemMonitor;