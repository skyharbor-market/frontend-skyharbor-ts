import { refund } from "@/ergofunctions/marketfunctions/refund";
import { BuyBoxInterface, EmptyBuyBoxInterface } from "interfaces/BuyBoxInterface";

interface CancelInterface {
  buyBox: BuyBoxInterface | EmptyBuyBoxInterface;
  userAddresses: string[]; //All user addresses so we can look through all and check if they have balance
}


export const delistNft = async ({ buyBox, userAddresses }: CancelInterface) => {
  // Use local WASM function for delisting
  return await refund(buyBox);
};

// Legacy API function - kept for reference but not used
// export const delistNftApi = async ({ buyBox, userAddresses }: CancelInterface): Promise<TransactionPromiseInterface> => {
//   try {
//     const res = await axios.post(
//       `${skyHarborTestApi}/api/transactions/delist`,
//       {
//         userAddresses: userAddresses,
//         cancelBox: buyBox,
//       }
//     );
//     const transaction_to_sign: TransactionPromiseInterface = res.data;

//     return transaction_to_sign;
//   } catch (err: any) {
//     throw err?.response?.data;
//   }
// };
