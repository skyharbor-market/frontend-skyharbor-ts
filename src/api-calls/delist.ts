import { skyHarborApi, skyHarborTestApi } from "@/ergofunctions/consts";
import { signWalletTx } from "@/ergofunctions/utxos";
import axios from "axios";
import { BuyBoxInterface, EmptyBuyBoxInterface } from "interfaces/BuyBoxInterface";
import { TransactionPromiseInterface } from "interfaces/TransactionPromiseInterface";

interface CancelInterface {
  buyBox: BuyBoxInterface | EmptyBuyBoxInterface;
  userAddresses: string[]; //All user addresses so we can look through all and check if they have balance
}


export const delistNft = async ({ buyBox, userAddresses }: CancelInterface) => {
  const builtTx = await delistNftApi({ buyBox, userAddresses });

  console.log(builtTx)
  return await signWalletTx(builtTx.transaction_to_sign);
};

export const delistNftApi = async ({ buyBox, userAddresses }: CancelInterface): Promise<TransactionPromiseInterface> => {
  const res = await axios.post(
    `${skyHarborTestApi}/api/transactions/delist`,
    {
      userAddresses: userAddresses,
      cancelBox: buyBox,
    }
  );

  const transaction_to_sign: TransactionPromiseInterface = res.data

  return transaction_to_sign;
};
