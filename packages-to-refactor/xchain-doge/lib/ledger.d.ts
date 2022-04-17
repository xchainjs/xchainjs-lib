import { LedgerTxInfo, LedgerTxInfoParams } from './types/ledger';
/**
 * Create transaction info.
 *
 * @param {LedgerTxInfoParams} params The transaction build options.
 * @returns {LedgerTxInfo} The transaction info used for ledger sign.
 */
export declare const createTxInfo: (params: LedgerTxInfoParams) => Promise<LedgerTxInfo>;
