export interface BalanceSnapshot {
    timestamp: number;
    totalBalance: number;
    toppedUpBalance: number;
    grantedBalance: number;
    currency: string;
}

export interface ConsumptionStats {
    daily: { consumed: number; label: string } | null;
    weekly: { consumed: number; label: string } | null;
    monthly: { consumed: number; label: string } | null;
    total: { consumed: number; label: string } | null;
    avgDaily: { consumed: number; days: number } | null;
    historyLength: number;
}

export const MAX_SNAPSHOTS = 3000;

export function pruneHistory(history: BalanceSnapshot[]): BalanceSnapshot[] {
    const sorted = [...history].sort((a, b) => a.timestamp - b.timestamp);
    if (sorted.length <= MAX_SNAPSHOTS) return sorted;

    const now = Date.now();
    const MS_DAY = 24 * 60 * 60 * 1000;
    const MS_WEEK = 7 * MS_DAY;

    const recent = sorted.filter(s => s.timestamp >= now - MS_WEEK);
    const old = sorted.filter(s => s.timestamp < now - MS_WEEK);
    if (old.length === 0) return sorted;

    const days = new Map<string, BalanceSnapshot>();
    for (const snap of old) {
        const dayKey = new Date(snap.timestamp).toISOString().slice(0, 10);
        if (!days.has(dayKey) || snap.timestamp < days.get(dayKey)!.timestamp) {
            days.set(dayKey, snap);
        }
    }

    return [...recent, ...days.values()].sort((a, b) => a.timestamp - b.timestamp);
}

export function calculateConsumption(sortedHistory: BalanceSnapshot[], minTimestamp: number): number | null {
    const snapshots = sortedHistory.filter(s => s.timestamp >= minTimestamp);
    if (snapshots.length < 2) return null;

    let totalConsumed = 0;
    for (let i = 1; i < snapshots.length; i++) {
        const diff = snapshots[i - 1].totalBalance - snapshots[i].totalBalance;
        if (diff > 0) {
            totalConsumed += diff;
        }
    }
    return totalConsumed;
}
