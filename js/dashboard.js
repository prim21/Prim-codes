// Dashboard JavaScript Functions
class DashboardManager {
    constructor() {
        // Start with empty logs - data will be added when "Feed Me" is clicked
        this.feedingLogs = [];
        
        // Additional older logs that will show when "more" is clicked (empty initially)
        this.olderLogs = [];
        
        this.weekLogs = [];
        
        this.currentFilter = 'today';
        this.pieChart = null;
        this.showingMore = false;
        
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
                
                const filter = e.target.getAttribute('data-filter');
                this.filterLogs(filter);
            });
        });

        // Add event listener for Feed Me button
        const feedMeButton = document.getElementById('feed-me-button');
        if (feedMeButton) {
            feedMeButton.addEventListener('click', () => {
                this.feedMe();
            });
        }

        // Add event listener for More button
        const moreButton = document.getElementById('more-button');
        if (moreButton) {
            moreButton.addEventListener('click', () => {
                this.loadMore();
            });
        }

        // Add event listener for Delete All button
        const deleteAllButton = document.getElementById('delete-all-button');
        if (deleteAllButton) {
            deleteAllButton.addEventListener('click', () => {
                this.deleteAllLogs();
            });
        }
    }
    
    populateLogsTable() {
        const tbody = document.getElementById('logsTableBody');
        if (!tbody) return;
        
        let logs;
        if (this.currentFilter === 'today') {
            logs = this.showingMore ? [...this.feedingLogs, ...this.olderLogs] : this.feedingLogs;
        } else {
            logs = this.weekLogs;
        }
        
        // If no logs, show empty table
        if (logs.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="6" style="text-align: center; padding: 2rem; color: var(--text-gray); font-style: italic;">
                        No feeding logs yet. Click "Feed Me" to start feeding.
                    </td>
                </tr>
            `;
            this.updateMoreButton();
            return;
        }
        
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
                    <td><i class="fas fa-trash delete-icon" onclick="window.dashboardManager.deleteLogEntry(this)" title="Delete"></i></td>
                </tr>
            `;
        }).join('');
        
        // Update more button visibility
        this.updateMoreButton();
    }
    
    updateMoreButton() {
        const moreBtn = document.getElementById('more-button');
        if (!moreBtn) return;
        
        // Only show "more" button if there are older logs available and we're not showing them yet
        if (this.currentFilter === 'today' && !this.showingMore && this.olderLogs.length > 0) {
            moreBtn.style.display = 'flex';
        } else {
            moreBtn.style.display = 'none';
        }
    }
    
    loadMore() {
        this.showingMore = true;
        const moreBtn = document.getElementById('more-button');
        const originalText = moreBtn.innerHTML;
        
        moreBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Loading...';
        moreBtn.disabled = true;
        
        // Simulate loading delay
        setTimeout(() => {
            this.populateLogsTable();
            moreBtn.innerHTML = originalText;
            moreBtn.disabled = false;
        }, 1000);
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
        this.showingMore = false; // Reset more state when filtering
        this.populateLogsTable();
        this.updateStats();
    }
    
    deleteLogEntry(element) {
        if (confirm('Are you sure you want to delete this feeding log?')) {
            const row = element.closest('tr');
            const date = row.cells[0].textContent;
            const time = row.cells[1].textContent;
            const amount = row.cells[2].textContent;
            
            // Remove from data arrays
            this.feedingLogs = this.feedingLogs.filter(log => 
                !(log.date === date && log.time === time && log.amount === amount)
            );
            this.olderLogs = this.olderLogs.filter(log => 
                !(log.date === date && log.time === time && log.amount === amount)
            );
            this.weekLogs = this.weekLogs.filter(log => 
                !(log.date === date && log.time === time && log.amount === amount)
            );
            
            // Animate and remove row
            row.style.animation = 'fadeOut 0.3s ease-out';
            setTimeout(() => {
                this.populateLogsTable();
                this.updateStats();
            }, 300);
        }
    }

    async deleteAllLogs() {
        // Show confirmation dialog
        const confirmed = confirm('Are you sure you want to delete ALL feeding logs? This action cannot be undone and will also clear the data from the ESP32.');
        
        if (!confirmed) return;

        const deleteAllBtn = document.getElementById('delete-all-button');
        const originalHTML = deleteAllBtn.innerHTML;
        
        // Show loading state
        deleteAllBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Deleting...';
        deleteAllBtn.disabled = true;

        try {
            // Send DELETE request to ESP32
            // Replace 'YOUR_ESP32_IP' with your actual ESP32 IP address
            const response = await fetch('http://YOUR_ESP32_IP/deleteAll', {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            if (response.ok) {
                // Clear all log arrays
                this.feedingLogs = [];
                this.olderLogs = [];
                this.weekLogs = [];
                this.showingMore = false;

                // Update the UI
                this.populateLogsTable();
                this.updateStats();

                // Show success message
                alert('All feeding logs have been deleted successfully!');
            } else {
                alert('Failed to delete logs from ESP32. Please try again.');
            }
        } catch (error) {
            console.error('Error deleting all logs:', error);
            alert('Error connecting to the ESP32. The logs may have been cleared locally but not on the device. Please check your connection and try again.');
            
            // Still clear local data even if ESP32 request fails
            this.feedingLogs = [];
            this.olderLogs = [];
            this.weekLogs = [];
            this.showingMore = false;
            this.populateLogsTable();
            this.updateStats();
        } finally {
            // Restore button state
            deleteAllBtn.innerHTML = originalHTML;
            deleteAllBtn.disabled = false;
        }
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
                    data: [0, 100],
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
        let logs;
        if (this.currentFilter === 'today') {
            logs = this.showingMore ? [...this.feedingLogs, ...this.olderLogs] : this.feedingLogs;
        } else {
            logs = this.weekLogs;
        }
        
        const completedFeedings = logs.filter(log => log.status === 'Completed').length;
        
        // Update total feedings (start with 0 if no logs)
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
        const percentage = totalDispensedKg > 0 ? Math.round((parseFloat(totalDispensedKg) / totalCapacity) * 100) : 0;
        
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
    
    addNewFeeding() {
        const now = new Date();
        const dateString = now.toISOString().split('T')[0];
        const timeString = now.toTimeString().slice(0, 5);
        
        // Generate random amount between 150g and 250g
        const amounts = ['150g', '170g', '180g', '200g', '220g', '250g'];
        const randomAmount = amounts[Math.floor(Math.random() * amounts.length)];
        
        const newLog = {
            date: dateString,
            time: timeString,
            amount: randomAmount,
            status: 'Completed',
            hasPhoto: true
        };
        
        // Add to the beginning of the array (most recent first)
        this.feedingLogs.unshift(newLog);
        this.weekLogs.unshift(newLog);
        
        // Move older entries to olderLogs array to show with "more" button
        // Keep only the 5 most recent in feedingLogs, move rest to olderLogs
        if (this.feedingLogs.length > 5) {
            const movedLogs = this.feedingLogs.splice(5); // Remove entries beyond index 5
            this.olderLogs.unshift(...movedLogs); // Add them to the beginning of olderLogs
        }
        
        this.populateLogsTable();
        this.updateStats();
    }

    feedMe() {
        console.log('Feed Me clicked!');
        
        // Add visual feedback
        const feedButton = document.getElementById('feed-me-button');
        if (feedButton) {
            feedButton.style.transform = 'translateY(-3px) scale(0.95)';
            feedButton.style.boxShadow = '0 6px 20px rgba(230, 57, 70, 0.5)';
            
            setTimeout(() => {
                feedButton.style.transform = '';
                feedButton.style.boxShadow = '';
            }, 200);
        }
        
        // Show confirmation
        const statValue = feedButton.querySelector('.stat-value');
        const originalText = statValue.textContent;
        statValue.textContent = 'Feeding...';
        
        setTimeout(() => {
            statValue.textContent = 'Fed!';
            setTimeout(() => {
                statValue.textContent = originalText;
            }, 2000);
        }, 1000);
        
        // Add new feeding entry
        this.addNewFeeding();
    }
}

// Global Functions (for backward compatibility with existing HTML onclick handlers)
function feedMe() {
    if (window.dashboardManager) {
        window.dashboardManager.feedMe();
    }
}

function deleteLog(element) {
    if (window.dashboardManager) {
        window.dashboardManager.deleteLogEntry(element);
    }
}

function loadMoreLogs() {
    if (window.dashboardManager) {
        window.dashboardManager.loadMore();
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