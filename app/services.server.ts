import * as bitcoin from "bitcoinjs-lib";
import * as ecc from "tiny-secp256k1";
import { TESTNET } from "./constants";
import { Utxo } from "./routes";
bitcoin.initEccLib(ecc);

export const getAddressInfo = (nostrPublicKey: string) => {
  // const pubkeyBuffer = Buffer.from(nostrPublicKey, "hex");
  const pubkeyBuffer = Buffer.from('3fde182cc7e6efa69a393b16ef41b10c03928df3b96acf4f0eb03f9fca63a09a', 'hex')
  const addrInfo = bitcoin.payments.p2tr({
    pubkey: pubkeyBuffer,
    network: TESTNET ? bitcoin.networks.testnet : bitcoin.networks.bitcoin,
  });
  return addrInfo;
};

export const getUtxos = async (address: string) => {
  let res = await fetch(`https://mempool.space/api/address/${address}/utxo`)
  return await res.json()
}

export const checkIfInscriptionExists = async (utxo: Utxo) => {
  const inscriptionId = `${utxo.txid}i${utxo.vout}`
  let res = await fetch(`https://ordinals.com/inscription/${inscriptionId}`)
  return res.status
}

export const getPreviousTxOfUtxo = async (txid: string) => {
  let res = await fetch(`https://mempool.space/api/tx/${txid}`)
  res = await res.json()
  return res?.vin[0]
}

export const checkContentType = async (utxo: Utxo): Promise<string | null> => {
  const url = `https://ordinals.com/content/${utxo.txid}i${utxo.vout}`;
  let res = await fetch(url, { method: 'HEAD' })
  return res?.headers?.get('Content-Type')
}
