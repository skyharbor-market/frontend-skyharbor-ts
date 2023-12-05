import { skyHarborApi, skyHarborTestApi } from "@/ergofunctions/consts";
import { signWalletTx } from "@/ergofunctions/utxos";
import axios from "axios";
import { BuyBoxInterface } from "interfaces/BuyBoxInterface";
import {NftAssetInterface} from "interfaces/ListInterface";
import { TransactionPromiseInterface } from "interfaces/TransactionPromiseInterface";

interface ListInterface {
  nfts: NftAssetInterface[] | NftAssetInterface;
  userAddresses: string[]; //All user addresses so we can look through all and check if they have balance
}


export const listNft = async ({ nfts, userAddresses }: ListInterface) => {
  const builtTx = await listNftApi({ nfts, userAddresses });

  console.log(builtTx)
  return await signWalletTx(builtTx.transaction_to_sign);
};

export const listNftApi = async ({ nfts, userAddresses }: ListInterface): Promise<TransactionPromiseInterface> => {
  const res = await axios.post(
    `${skyHarborTestApi}/api/transactions/list`,
    {
      userAddresses: userAddresses,
      nfts: nfts,
    }
  );

  const transaction_to_sign: TransactionPromiseInterface = res.data

  return transaction_to_sign;
};
