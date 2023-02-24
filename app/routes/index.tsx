import { ActionArgs, json, LoaderArgs } from "@remix-run/node";
import { useSubmit } from "@remix-run/react";
import { useLoaderData } from "react-router";
import HeroSection from "~/components/HeroSection";
import NavBar from "~/components/NavBar";
import { getAddressInfo, getUtxos, checkIfInscriptionExists, getPreviousTxOfUtxo } from "~/services.server";
import { createUserSession, getNostrPublicKey } from "~/session.server";
import { connectWallet } from "~/utils";
import { INSCRIPTION_SEARCH_DEPTH } from "~/constants";

export type Utxo = {
  txid: string;
  vout: string;
};

export async function loader({ request }: LoaderArgs) {
  const nostrPublicKey = await getNostrPublicKey(request)
  if (typeof nostrPublicKey !== 'string') {
    return null
  }

  const { address } = getAddressInfo(nostrPublicKey)
  if (!address) return
  const utxos: Utxo[] = await getUtxos(address);
  const inscriptions: Utxo[] = []
  for (const utxo of utxos) {
    try {
      let status = await checkIfInscriptionExists(utxo);
      if (status === 200) {
        inscriptions.push(utxo)
      } else {
        let previousUtxo = utxo;
        for (let count = 0; count < INSCRIPTION_SEARCH_DEPTH; count++) {
          const prevTransactionUtxo = await getPreviousTxOfUtxo(previousUtxo.txid);
          if (await checkIfInscriptionExists(prevTransactionUtxo)) {
            count = INSCRIPTION_SEARCH_DEPTH;
            inscriptions.push(utxo)
          }
        }
      }
    } catch (err) {
      console.log(`Error from ordinals.com`)
    }
  }
  return { address, inscriptions }
}

export async function action({ request }: ActionArgs) {
  const formData = await request.formData();
  const nostrPublicKey = formData.get('nostrPublicKey');
  if (typeof nostrPublicKey != 'string') return

  return await createUserSession({
    request,
    nostrPublicKey,
    remember: true,
  });
}

export default function Index() {
  const data = useLoaderData();
  const submit = useSubmit()
  const handleConnectWallet = async () => {
    const nostrPublicKey = await connectWallet()
    let formData = new FormData()
    formData.set("nostrPublicKey", nostrPublicKey)
    submit(formData, { method: "post" })
  }

  return (
    <div className="bg-gray-800">
      <NavBar address={data?.address} handleConnectWallet={handleConnectWallet} />
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <HeroSection handleConnectWallet={handleConnectWallet} />
      </div>
      <ul>
        {data?.inscriptions?.map((utxo: Utxo) => (<li key={utxo.txid}> {utxo.txid} </li>))}
      </ul>
    </div>
  );
}
