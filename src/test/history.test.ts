import * as assert from 'assert';
import { pruneHistory, BalanceSnapshot } from '../logic';

describe('History Logic Tests', () => {
    
    it('pruneHistory should keep snapshots sorted even if not pruned', () => {
        const now = Date.now();
        const history: BalanceSnapshot[] = [];
        
        // Add snapshots in reverse order
        for (let i = 0; i < 10; i++) {
            history.push({
                timestamp: now - (i * 1000),
                totalBalance: 10 - i,
                toppedUpBalance: 10 - i,
                grantedBalance: 0,
                currency: 'USD'
            });
        }

        const pruned = pruneHistory(history);
        
        // Verify sorting
        for (let i = 1; i < pruned.length; i++) {
            assert.ok(pruned[i].timestamp >= pruned[i-1].timestamp, `Snapshot at ${i} should be >= than at ${i-1}`);
        }
    });

    it('pruneHistory should return sorted data', () => {
        // This test will fail currently because history.length < 3000 and it returns unsorted input
        // I will fix pruneHistory to always sort.
    });
});
