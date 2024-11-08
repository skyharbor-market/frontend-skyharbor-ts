import { skyHarborApi, skyHarborTestApi } from "@/ergofunctions/consts";
import { signWalletTx } from "@/ergofunctions/utxos";
import axios from "axios";
import { BuyBoxInterface, EmptyBuyBoxInterface } from "interfaces/BuyBoxInterface";
import { TransactionPromiseInterface } from "interfaces/TransactionPromiseInterface";


interface EditInterface {
  editBox: BuyBoxInterface | EmptyBuyBoxInterface;
  currency: string;
  newPrice: number;
  userAddresses: string[];
}


export const editNft = async ({ editBox, currency, newPrice, userAddresses }: EditInterface) => {
  const builtTx = await editNftApi({ editBox, currency, newPrice, userAddresses });

  console.log(builtTx);
  return await signWalletTx(builtTx.transaction_to_sign);
};

export const editNftApi = async ({
  editBox,
  currency,
  newPrice,
  userAddresses,
}: EditInterface): Promise<TransactionPromiseInterface> => {
  const res = await axios.post(`${skyHarborTestApi}/api/transactions/edit`, {
    editBox,
    currency,
    newPrice,
    userAddresses
  });

  const transaction_to_sign: TransactionPromiseInterface = res.data;

  return transaction_to_sign;
};
