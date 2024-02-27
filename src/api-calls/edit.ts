import { skyHarborApi, skyHarborTestApi } from "@/ergofunctions/consts";
import { signWalletTx } from "@/ergofunctions/utxos";
import axios from "axios";
import { BuyBoxInterface } from "interfaces/BuyBoxInterface";
import { TransactionPromiseInterface } from "interfaces/TransactionPromiseInterface";

interface BuyInterface {
  buyBox: BuyBoxInterface;
  userAddresses: string[]; //All user addresses so we can look through all and check if they have balance
}


export const buyNft = async ({ buyBox, userAddresses }: BuyInterface) => {
  const builtTx = await buyNftApi({ buyBox, userAddresses });

  console.log(builtTx)
  return await signWalletTx(builtTx.transaction_to_sign);
};

export const buyNftApi = async ({ buyBox, userAddresses }: BuyInterface): Promise<TransactionPromiseInterface> => {
  const res = await axios.post(
    `${skyHarborTestApi}/api/transactions/buy`,
    {
      userAddresses: userAddresses,
      buyBox: buyBox,
    }
  );

  const transaction_to_sign: TransactionPromiseInterface = res.data

  return transaction_to_sign;
};
