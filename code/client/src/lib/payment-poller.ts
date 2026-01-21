/**
 * Client-side utility to trigger server-side payment polling
 * This ensures transaction status is checked even after user leaves the page
 */

let pollingInterval: NodeJS.Timeout | null = null;

export const PaymentPoller = {
    /**
     * Start polling for pending transactions
     * Calls the server endpoint every 30 seconds
     */
    start() {
        if (pollingInterval) {
            console.log('[Payment Poller] Already running');
            return;
        }

        console.log('[Payment Poller] Starting...');

        // Poll immediately
        this.checkNow();

        // Then poll every 30 seconds
        pollingInterval = setInterval(() => {
            this.checkNow();
        }, 30000); // 30 seconds
    },

    /**
     * Stop polling
     */
    stop() {
        if (pollingInterval) {
            clearInterval(pollingInterval);
            pollingInterval = null;
            console.log('[Payment Poller] Stopped');
        }
    },

    /**
     * Trigger an immediate check
     */
    async checkNow() {
        try {
            const response = await fetch('/api/payments/poll-status', {
                method: 'GET',
                cache: 'no-store'
            });

            const data = await response.json();
            console.log('[Payment Poller] Check completed:', data);

            return data;
        } catch (error) {
            console.error('[Payment Poller] Error:', error);
        }
    }
};
