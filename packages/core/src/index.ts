interface CoreClient {
  phrase: string;
  setPhrase(phrase?: string): void;
  getBalance(address?: string): Promise<number>;
  getTransactions(address: string): Promise<any>;
  getExplorerUrl(): string;
  transfer(
    asset: string,
    amount: number,
    recipient: string,
    memo: string,
    feeRate: number
  ): any;
}

const yo = 42;

export { CoreClient, yo };
