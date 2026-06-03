import * as https from 'https';
import * as loc from './localization';

export interface BalanceInfo {
    currency: string;
    total_balance: string;
    granted_balance: string;
    topped_up_balance: string;
}

export interface UserBalanceResponse {
    is_available: boolean;
    balance_infos: BalanceInfo[];
}

export interface ModelInfo {
    id: string;
    object: string;
    owned_by: string;
}

export interface ModelsResponse {
    object: string;
    data: ModelInfo[];
}

export function fetchUserBalance(apiKey: string): Promise<UserBalanceResponse> {
    return makeHttpsGetRequest('https://api.deepseek.com/user/balance', apiKey);
}

export function fetchModels(apiKey: string): Promise<ModelsResponse> {
    return makeHttpsGetRequest('https://api.deepseek.com/models', apiKey);
}

function makeHttpsGetRequest<T>(url: string, apiKey: string): Promise<T> {
    return new Promise((resolve, reject) => {
        const options = {
            headers: {
                'Authorization': `Bearer ${apiKey}`,
                'Accept': 'application/json',
                'User-Agent': 'VSCode-DeepSeek-Account-Info-Extension'
            }
        };

        const req = https.get(url, options, (res: any) => {
            let data = '';

            res.on('data', (chunk: any) => {
                data += chunk;
            });

            res.on('end', () => {
                if (res.statusCode && res.statusCode >= 200 && res.statusCode < 300) {
                    try {
                        const parsed = JSON.parse(data);
                        resolve(parsed as T);
                    } catch (e) {
                        reject(new Error(`${loc.strParseError()} ${e instanceof Error ? e.message : String(e)}`));
                    }
                } else {
                    try {
                        const errObj = JSON.parse(data);
                        reject(new Error(errObj.error?.message || loc.strHttpError(res.statusCode)));
                    } catch {
                        reject(new Error(loc.strHttpError(res.statusCode)));
                    }
                }
            });
        });

        req.on('error', (err: any) => {
            reject(new Error(`${loc.strNetworkError()} ${err.message}`));
        });

        req.setTimeout(10000, () => {
            req.destroy();
            reject(new Error(loc.strTimeout()));
        });
    });
}
