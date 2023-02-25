import { cloudfrontUrl, ordinalsImageUrl } from "~/utils";
import { Utxo } from "~/types";

export default function InscriptionCard({ ordinal }: { ordinal: Utxo }) {
  const url = ordinal?.status?.confirmed ? ordinalsImageUrl(ordinal) : cloudfrontUrl(ordinal)
  const isImage = ordinal?.contentType?.startsWith('image')
  return (
    <div
      key={ordinal.txid}
      className="group relative flex flex-col overflow-hidden rounded-lg border border-yellow-400 bg-white"
    >
      <div className="aspect-w-3 aspect-h-4 bg-gray-200 group-hover:opacity-75 sm:aspect-none sm:h-96">
        {isImage ?
          <img
            src={url}
            alt={ordinal.txid}
            className="h-full w-full object-cover object-center sm:h-full sm:w-full"
          /> : <iframe src={url} />
        }
      </div>
      <div className="flex flex-1 flex-col space-y-2 p-4">
        <h3 className="text-sm font-medium text-gray-900 overflow-hidden">
          <span>
            {ordinal.txid}
          </span>
        </h3>
        <div className="flex flex-1 flex-col justify-end">
          <p className="text-base font-medium text-gray-900">{ordinal.value} sats</p>
        </div>
      </div>
    </div>
  )
}
