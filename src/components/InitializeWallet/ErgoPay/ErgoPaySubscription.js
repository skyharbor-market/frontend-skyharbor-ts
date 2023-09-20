import { gql, useSubscription } from "@apollo/client";
import React, { Fragment, useEffect } from "react";

const SUBSCRIBE_ERGOPAY = gql`
  subscription checkErgoPayConnected($uuid: String!) {
    active_sessions(
      where: { uuid: { _eq: $uuid } }
      limit: 1
      order_by: { last_connect_time: desc }
    ) {
      uuid
      wallet_address
      last_connect_time
    }
  }
`;

function ErgoPaySubscription({ uuid, toggleModal, setErgopayState }) {
  const { loading, error, data } = useSubscription(SUBSCRIBE_ERGOPAY, {
    variables: {
      uuid: uuid,
    },
  });

  // Once the subscription returns data, update the UI button to show they have connected. also do a toast and close out the modal.
  // Also store the wallet address in redux, as well as localstorage for their UUID

  useEffect(() => {
    if (data && data.active_sessions.length > 0) {
      // store in localstorage and add it to redux
      localStorage.setItem(
        "wallet",
        JSON.stringify({
          type: "ergopay",
          address: data.active_sessions[0].wallet_address,
          uuid: data.active_sessions[0].uuid,
        })
      );
      setErgopayState(
        data.active_sessions[0].wallet_address,
        data.active_sessions[0].uuid
      );
      toggleModal();
      // showMsgSuccess('Successfully connected ErgoPay')
      console.log("Successfully connected ErgoPay");
    }
  }, [data]);

  return <Fragment></Fragment>;
}

export default ErgoPaySubscription;
