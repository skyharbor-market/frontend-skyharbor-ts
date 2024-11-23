import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { useSelector } from 'react-redux';
import { useQuery } from '@apollo/client';
import { GET_COLLECTION_NFTS, GET_RECENTLY_LISTED } from '../../lib/gqlQueries';
import { convertGQLObject, friendlyAddress } from '../../ergofunctions/helpers';
import NFTCard from '../NFTCard/NFTCard';
import { CheckCircleIcon } from '@heroicons/react/24/outline';
import LoadingCircle from '../LoadingCircle/LoadingCircle';

export default function RecentlyListed({collection, collection_name, verified}) {
    const router = useRouter();
    const userAddresses = useSelector((state) => state.wallet.addresses);
    const loadAmount = 10;
    const [latestTokens, setLatestTokens] = useState([]);

    const { data, loading, error } = useQuery(GET_COLLECTION_NFTS, {
        variables: { 
            collection,
            limit: loadAmount
        },
    });

    useEffect(() => {
        if (data && data.sales) {
            const convertedTokens = data.sales.map(convertGQLObject);
            setLatestTokens(convertedTokens);
        }
    }, [data]);

    const gotoCollection = (sys) => {
        router.push(`/collection/${sys}`);
    };

    if (loading) return <div className="w-24 h-24 mx-auto"><LoadingCircle /></div>;
    if (error) return <p>Error: {error.message}</p>;
    if (!latestTokens || latestTokens.length === 0) return null;

    console.log("latestTokens", latestTokens);

    return (
        <div className="container mx-auto px-4">
            <h2 className="text-2xl font-bold mb-6">
                Recently listed in {verified === true ? (
                    <span 
                        className="font-semibold text-blue-500 hover:opacity-80 cursor-pointer"
                        onClick={() => gotoCollection(collection)}
                    >
                        {collection_name} 
                        <CheckCircleIcon className="inline-block ml-1 h-5 w-5 text-blue-500" />
                    </span>
                ) : (
                    <span>Unverified {friendlyAddress(collection_name, 4)}</span>
                )}
            </h2>

            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 xl:grid-cols-6 gap-5">
                {latestTokens.map((item) => (
                    <div key={item.box_id}>
                        <NFTCard
                            token={item}
                            userAddresses={userAddresses}
                            isOwner={userAddresses ? userAddresses.includes(item.seller_address) : false}
                        /> 
                    </div>
                ))}
            </div>
            <div className="text-center mt-8">
                <button 
                    className="px-4 py-2 border border-blue-500 text-blue-500 rounded hover:bg-blue-500 hover:text-white transition-colors"
                    onClick={() => gotoCollection(collection)}
                >
                    View more
                </button>
            </div>
        </div>
    );
}
