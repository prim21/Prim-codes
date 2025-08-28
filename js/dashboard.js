// Dashboard JavaScript Functions
class DashboardManager {
    constructor() {
        this.feedingLogs = [
            { date: '2025-08-28', time: '16:06', amount: '200g', status: 'Completed', hasPhoto: true },
            { date: '2025-08-28', time: '16:06', amount: '200g', status: 'Completed', hasPhoto: true },
            { date: '2025-08-28', time: '16:06', amount: '200g', status: 'Completed', hasPhoto: true },
            { date: '2025-08-28', time: '16:06', amount: '200g', status: 'Completed', hasPhoto: true },
            { date: '2025-08-28', time: '16:06', amount: '200g', status: 'Completed', hasPhoto: true },
            { date: '2025-07-27', time: '14:30', amount: '200g', status: 'Completed', hasPhoto: true },
            { date: '2025-07-27', time: '13:45', amount: '150g', status: 'Completed', hasPhoto: true },
            { date: '2025-07-27', time: '12:15', amount: '180g', status: 'Completed', hasPhoto: true },
            { date: '2025-07-27', time: '11:30', amount: '160g', status: 'Failed', hasPhoto: false },
            { date: '2025-07-27', time: '10:45', amount: '220g', status: 'Completed', hasPhoto: true },
            { date: '2025-07-27', time: '09:15', amount: '140g', status: 'Pending', hasPhoto: false }
        ];
        
        this.weekLogs = [
            ...this.feedingLogs,
            { date: '2025-07-26', time: '16:20', amount: '180g', status: 'Completed', hasPhoto: true },
            { date: '2025-07-26', time: '14:15', amount: '170g', status: 'Completed', hasPhoto: true },
            { date: '2025-07-26', time: '11:45', amount: '190g', status: 'Failed', hasPhoto: false },
            { date: '2025-07-25', time: '15:30', amount: '200g', status: 'Completed', hasPhoto: true }
        ];
        
        this.currentFilter = 'today';
        this.pieChart = null;
        
        this.init();
    }
    
    init() {
        // Initialize the dashboard when DOM is loaded
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => {
                this.setupEventListeners();
                this.populateLogsTable();
                this.initializePieChart();
                this.updateStats();
            });
        } else {
            this.setupEventListeners();
            this.populateLogsTable();
            this.initializePieChart();
            this.updateStats();
        }
    }
    
    setupEventListeners() {
        // Add event listeners for filter buttons
        const filterButtons = document.querySelectorAll('.time-btn');
        filterButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                filterButtons.forEach(b => b.classList.remove('active'));
                e.target.classList.add('active');
                
                if (e.target.textContent.includes('Today')) {
                    this.filterLogs('today');
                } else {
                    this.filterLogs('week');
                }
            });
        });
    }
    
    populateLogsTable() {
        const tbody = document.getElementById('logsTableBody');
        if (!tbody) return;
        
        const logs = this.currentFilter === 'today' ? this.feedingLogs : this.weekLogs;
        
        tbody.innerHTML = logs.map(log => {
            const statusClass = log.status.toLowerCase();
            const photoIcon = this.getPhotoIcon(log.status, log.hasPhoto);
            
            return `
                <tr>
                    <td>${log.date}</td>
                    <td>${log.time}</td>
                    <td>${log.amount}</td>
                    <td><span class="status-badge ${statusClass}">${log.status}</span></td>
                    <td>${photoIcon}</td>
                </tr>
            `;
        }).join('');
    }
    
    getPhotoIcon(status, hasPhoto) {
        if (status === 'Failed') {
            return '<i class="fas fa-camera-slash photo-icon-disabled" title="No photo available"></i>';
        } else if (status === 'Pending') {
            return '<i class="fas fa-clock photo-icon-pending" title="Photo pending"></i>';
        } else if (hasPhoto) {
            return '<i class="fas fa-camera photo-icon" title="Photo available"></i>';
        } else {
            return '<i class="fas fa-camera-slash photo-icon-disabled" title="No photo available"></i>';
        }
    }
    
    filterLogs(filter) {
        this.currentFilter = filter;
        this.populateLogsTable();
        this.updateStats();
    }
    
    initializePieChart() {
        const ctx = document.getElementById('pieChart');
        if (!ctx) return;
        
        if (this.pieChart) {
            this.pieChart.destroy();
        }
        
        this.pieChart = new Chart(ctx, {
            type: 'doughnut',
            data: {
                datasets: [{
                    data: [56, 44],
                    backgroundColor: ['#ff6b35', '#e5e7eb'],
                    borderWidth: 0,
                }]
            },
            options: {
                cutout: '70%',
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false
                    },
                    tooltip: {
                        enabled: false
                    }
                }
            }
        });
    }
    
    updateStats() {
        const logs = this.currentFilter === 'today' ? this.feedingLogs : this.weekLogs;
        const completedFeedings = logs.filter(log => log.status === 'Completed').length;
        
        // Update total feedings
        const totalFeedingsEl = document.getElementById('total-feedings');
        if (totalFeedingsEl) {
            totalFeedingsEl.textContent = completedFeedings;
        }
        
        // Calculate total food dispensed
        let totalDispensed = 0;
        logs.forEach(log => {
            if (log.status === 'Completed') {
                totalDispensed += parseInt(log.amount);
            }
        });
        
        const totalDispensedKg = (totalDispensed / 1000).toFixed(1);
        const foodDispensedEl = document.getElementById('food-dispensed');
        if (foodDispensedEl) {
            foodDispensedEl.textContent = totalDispensedKg;
        }
        
        // Update pie chart details
        const foodDispensedDetailEl = document.getElementById('food-dispensed-detail');
        const foodRemainingDetailEl = document.getElementById('food-remaining-detail');
        const piePercentageEl = document.getElementById('pie-percentage');
        
        const totalCapacity = 3.2; // 3.2kg capacity
        const remaining = (totalCapacity - parseFloat(totalDispensedKg)).toFixed(1);
        const percentage = Math.round((parseFloat(totalDispensedKg) / totalCapacity) * 100);
        
        if (foodDispensedDetailEl) {
            foodDispensedDetailEl.textContent = `Food Dispensed: ${totalDispensedKg}kg`;
        }
        
        if (foodRemainingDetailEl) {
            foodRemainingDetailEl.textContent = `Remaining: ${remaining}kg`;
        }
        
        if (piePercentageEl) {
            piePercentageEl.textContent = `${percentage}%`;
        }
        
        // Update pie chart
        if (this.pieChart) {
            this.pieChart.data.datasets[0].data = [percentage, 100 - percentage];
            this.pieChart.update();
        }
    }
}

// Global Functions (for backward compatibility with existing HTML onclick handlers)
function feedMe() {
    // Simulate feeding action
    console.log('Manual feeding initiated...');
    
    // Add visual feedback
    const feedButton = document.querySelector('.stat-card.feed-me');
    if (feedButton) {
        feedButton.style.transform = 'translateY(-3px) scale(0.95)';
        feedButton.style.boxShadow = '0 6px 20px rgba(230, 57, 70, 0.5)';
        
        setTimeout(() => {
            feedButton.style.transform = '';
            feedButton.style.boxShadow = '';
        }, 200);
    }
    
    // Show confirmation
    const originalText = feedButton.querySelector('.stat-value').textContent;
    feedButton.querySelector('.stat-value').textContent = 'Feeding...';
    
    setTimeout(() => {
        feedButton.querySelector('.stat-value').textContent = 'Fed!';
        setTimeout(() => {
            feedButton.querySelector('.stat-value').textContent = originalText;
        }, 2000);
    }, 1000);
    
    // Update feeding logs (simulate new feeding)
    const now = new Date();
    const newLog = {
        date: now.toISOString().split('T')[0],
        time: now.toTimeString().slice(0, 5),
        amount: '200g',
        status: 'Completed',
        hasPhoto: true
    };
    
    // Add to dashboard manager if it exists
    if (window.dashboardManager) {
        window.dashboardManager.feedingLogs.unshift(newLog);
        window.dashboardManager.populateLogsTable();
        window.dashboardManager.updateStats();
    }
}

function filterLogs(filter) {
    if (window.dashboardManager) {
        window.dashboardManager.filterLogs(filter);
    }
}

function scrollToActivity() {
    // Scroll to live data component
    const liveDataSection = document.querySelector('.live-data-section');
    if (liveDataSection) {
        liveDataSection.scrollIntoView({ behavior: 'smooth' });
    }
}

// Initialize Dashboard Manager
window.dashboardManager = new DashboardManager();

// Export for module usage if needed
if (typeof module !== 'undefined' && module.exports) {
    module.exports = DashboardManager;
}