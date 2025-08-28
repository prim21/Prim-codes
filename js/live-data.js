// Live Data Component - Pure JavaScript Implementation
class LiveDataComponent {
    constructor() {
        this.currentWeight = 140;
        this.lastMotion = 0;
        this.dispensedAmount = 140;
        this.isEating = false;
        this.interval = null;
        
        this.init();
    }
    
    init() {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => {
                this.render();
                this.startSimulation();
            });
        } else {
            this.render();
            this.startSimulation();
        }
    }
    
    render() {
        const container = document.getElementById('live-data-container');
        if (!container) return;
        
        container.innerHTML = `
            <div class="live-data-container">
                <div class="live-data-header">
                    <h3 class="live-data-title">Live Data</h3>
                    <div class="live-indicator">
                        <div class="live-dot"></div>
                        <span class="live-text">Live</span>
                    </div>
                </div>

                <div class="live-data-content">
                    <div class="data-item">
                        <span class="data-label">Current Weight</span>
                        <div style="text-align: right;">
                            <div class="data-value" id="current-weight">
                                ${this.currentWeight.toFixed(0)}g
                            </div>
                            <div id="eating-status" style="font-size: 0.75rem; color: #ef4444; display: none;">
                                Eating...
                            </div>
                        </div>
                    </div>

                    <div class="data-item">
                        <span class="data-label">Food Consumed</span>
                        <div style="text-align: right;">
                            <div class="data-value" id="food-consumed">
                                ${(this.dispensedAmount - this.currentWeight).toFixed(0)}g (${Math.round(((this.dispensedAmount - this.currentWeight) / this.dispensedAmount) * 100)}%)
                            </div>
                            <div style="font-size: 0.75rem; color: #6b7280;">
                                of ${this.dispensedAmount}g dispensed
                            </div>
                        </div>
                    </div>

                    <div class="progress-bar">
                        <div class="progress-fill" id="progress-fill" style="width: ${Math.round(((this.dispensedAmount - this.currentWeight) / this.dispensedAmount) * 100)}%; background-color: ${this.getProgressColor(Math.round(((this.dispensedAmount - this.currentWeight) / this.dispensedAmount) * 100))}"></div>
                    </div>
                    </div>

                    <div class="data-item">
                        <span class="data-label">Last Motion</span>
                        <div style="text-align: right;">
                            <span class="data-value" id="last-motion">
                                ${this.formatTime(this.lastMotion)}
                            </span>
                            <div id="motion-status" style="font-size: 0.75rem; color: #f59e0b; display: none;">
                                Motion detected
                            </div>
                        </div>
                    </div>

                    <div class="status-section">
                        <span class="data-label">Bowl Status</span>
                        <div>
                            <span class="status-badge" id="bowl-status" style="${this.getBowlStatusStyles()}">
                                ${this.getBowlStatus()}
                            </span>
                        </div>
                    </div>

                    <div class="eating-indicator" id="eating-indicator" style="display: none;">
                        <div class="dots-container">
                            <div class="bounce-dot" style="animation-delay: 0s;"></div>
                            <div class="bounce-dot" style="animation-delay: 0.1s;"></div>
                            <div class="bounce-dot" style="animation-delay: 0.2s;"></div>
                        </div>
                        <span>Dog is eating</span>
                    </div>
                </div>
            </div>
        `;
    }
    
    startSimulation() {
        this.interval = setInterval(() => {
            this.simulateEating();
            this.updateDisplay();
        }, 2000);
    }
    
    simulateEating() {
        const shouldEat = Math.random() < 0.3; // 30% chance per interval
        
        if (shouldEat && this.currentWeight > 5) {
            const biteSize = Math.floor(Math.random() * 7) + 2;
            this.currentWeight = Math.max(0, this.currentWeight - biteSize);
            this.isEating = true;
            this.lastMotion = 0;
        } else {
            this.isEating = false;
            this.lastMotion += 1;
        }
    }
    
   
    updateDisplay() {
        // Update current weight
        const currentWeightEl = document.getElementById('current-weight');
        if (currentWeightEl) {
            currentWeightEl.textContent = `${this.currentWeight.toFixed(0)}g`;
        }
        
        // Update eating status
        const eatingStatusEl = document.getElementById('eating-status');
        if (eatingStatusEl) {
            eatingStatusEl.style.display = this.isEating ? 'block' : 'none';
        }
        
        // Update food consumed
        const consumedAmount = this.dispensedAmount - this.currentWeight;
        const consumedPercentage = Math.round((consumedAmount / this.dispensedAmount) * 100);
        
        const foodConsumedEl = document.getElementById('food-consumed');
        if (foodConsumedEl) {
            foodConsumedEl.textContent = `${consumedAmount.toFixed(0)}g (${consumedPercentage}%)`;
        }
        
        // Update progress bar
        const progressFillEl = document.getElementById('progress-fill');
        if (progressFillEl) {
            progressFillEl.style.width = `${consumedPercentage}%`;
            progressFillEl.style.backgroundColor = this.getProgressColor(consumedPercentage);
        }
        
      
        // Update last motion
        const lastMotionEl = document.getElementById('last-motion');
        if (lastMotionEl) {
            lastMotionEl.textContent = this.formatTime(this.lastMotion);
        }
        
        // Update motion status
        const motionStatusEl = document.getElementById('motion-status');
        if (motionStatusEl) {
            motionStatusEl.style.display = this.isEating ? 'block' : 'none';
        }
        
        // Update bowl status
        const bowlStatusEl = document.getElementById('bowl-status');
        if (bowlStatusEl) {
            bowlStatusEl.textContent = this.getBowlStatus();
            bowlStatusEl.style.cssText = this.getBowlStatusStyles();
        }
        
        // Update eating indicator
        const eatingIndicatorEl = document.getElementById('eating-indicator');
        if (eatingIndicatorEl) {
            eatingIndicatorEl.style.display = this.isEating ? 'flex' : 'none';
        }
    }
    
    formatTime(minutes) {
        if (minutes === 0) return "Just now";
        if (minutes === 1) return "1 min ago";
        return `${minutes} min ago`;
    }
    
    getProgressColor(percentage) {
        if (percentage > 80) return '#10b981';
        if (percentage > 50) return '#f59e0b';
        return '#3b82f6';
    }
    
    getBowlStatus() {
        if (this.currentWeight < 10) return 'Nearly Empty';
        if (this.currentWeight < 50) return 'Low';
        return 'Good';
    }
    
    getBowlStatusStyles() {
        const status = this.getBowlStatus();
        if (status === 'Nearly Empty') {
            return 'background-color: #fee2e2; color: #dc2626;';
        } else if (status === 'Low') {
            return 'background-color: #fef3c7; color: #d97706;';
        } else {
            return 'background-color: #d1fae5; color: #059669;';
        }
    }
    
    // Method to manually add food (called from dashboard)
    addFood(amount) {
        this.currentWeight += amount;
        this.dispensedAmount += amount;
        this.updateDisplay();
    }
    
    // Cleanup method
    destroy() {
        if (this.interval) {
            clearInterval(this.interval);
        }
    }
}

// Initialize the Live Data Component
window.liveDataComponent = new LiveDataComponent();

// Export for module usage if needed
if (typeof module !== 'undefined' && module.exports) {
    module.exports = LiveDataComponent;
}