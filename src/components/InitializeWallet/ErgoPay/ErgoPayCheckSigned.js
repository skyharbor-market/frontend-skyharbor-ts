import { gql, useSubscription } from '@apollo/client';
import { useToast } from '@chakra-ui/react';
import React, { Fragment, useEffect } from 'react'
import { withApollo } from '../../lib/withApollo';

const SUBSCRIBE_ERGOPAY = gql`
subscription checkSigned ($txId: String!) {
    pay_requests(where: {tx_id: {_eq: $txId}}) {
      id
      tx_id
      signed
    }
}
`

function ErgoPaySubscription({txId, userSignedTx}) {
    const toast = useToast()

    const { loading, error, data } = useSubscription(SUBSCRIBE_ERGOPAY, {
        variables: {
            txId: txId
        }
    });
    
    useEffect(()=> {
        if(data && data.pay_requests.length > 0) {
            if(data.pay_requests[0].signed) {
                // User has signed the transaction
                userSignedTx();
                toast({
                    title: "Transaction has been signed",
                    position: "bottom",
                    status: "success",
                    duration: 2000,
                    isClosable: true,
                })
            }
        }
    }, [data, txId])

    return (
        <Fragment>
        </Fragment>
    )
}

export default withApollo()(ErgoPaySubscription)
