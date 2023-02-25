export type Utxo = {
  txid: string;
  vout: string;
  status?: {
    confirmed: boolean
  };
  value?: string,
  contentType: string | null
};


