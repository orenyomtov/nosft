import { ActionArgs, LoaderArgs } from "@remix-run/node";
import { useSubmit } from "@remix-run/react";
import { useLoaderData } from "react-router";
import HeroSection from "~/components/HeroSection";
import NavBar from "~/components/NavBar";
import Card from "~/components/Card";
import { getAddressInfo, getUtxos, checkIfInscriptionExists, getPreviousTxOfUtxo, checkContentType } from "~/services.server";
import { createUserSession, getNostrPublicKey } from "~/session.server";
import { connectWallet } from "~/utils";
import { INSCRIPTION_SEARCH_DEPTH } from "~/constants";
import { Utxo } from "~/types";

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
        let contentType = await checkContentType(utxo);
        inscriptions.push({ ...utxo, contentType })
      } else {
        let previousUtxo = utxo;
        for (let count = 0; count < INSCRIPTION_SEARCH_DEPTH; count++) {
          const prevTransactionUtxo = await getPreviousTxOfUtxo(previousUtxo.txid);
          if (await checkIfInscriptionExists(prevTransactionUtxo)) {
            let contentType = await checkContentType(utxo);
            count = INSCRIPTION_SEARCH_DEPTH;
            inscriptions.push({ ...prevTransactionUtxo, status: utxo.status, value: utxo.value, contentType })
          } else {
            previousUtxo = prevTransactionUtxo
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
  const data = useLoaderData() as { address: string, inscriptions: Utxo[] };
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
      {!data?.address && <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <HeroSection handleConnectWallet={handleConnectWallet} />
      </div>}
      <div className="mx-auto max-w-2xl py-16 px-4 sm:py-24 sm:px-6 lg:max-w-7xl lg:px-8">
        <div className="grid grid-cols-1 gap-y-4 sm:grid-cols-2 sm:gap-x-6 sm:gap-y-10 lg:grid-cols-3 lg:gap-x-8">
          {data?.inscriptions?.map((ordinal: Utxo) => (
            <Card key={ordinal.txid} ordinal={ordinal} />
          ))}
        </div>
      </div>
    </div>
  );
}
