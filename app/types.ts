export type Utxo = {
  txid: string;
  vout: string;
  status?: {
    cofirmed: boolean
  };
  value?: string,
  contentType: string | null
};


