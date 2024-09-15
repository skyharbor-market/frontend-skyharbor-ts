import React, { Fragment } from 'react'
import { isJson } from '../ergofunctions/helpers'

export default function ShowMetadata({description}) {
    // Visualizing Metadata
    let metadataList = [];

    function letraMayuscula(texto) {
        return texto.charAt(0).toUpperCase() + texto.slice(1);
    }

    function visualizoMetadata(obj){
        for(var key in obj){
            if(!obj.hasOwnProperty(key)) continue;
            if(typeof obj[key] !== 'object') {
                if(key == 'image'){
                    metadataList.push(
                        <p key={`${key}: ${obj[key]}`} className="mb-2">
                            <span className="font-semibold">{letraMayuscula(key)}</span>
                            <a href={obj[key]} className="text-blue-500 hover:underline">: {obj[key].substring(8, 30)}...</a>
                        </p>
                    )
                } else if(!Array.isArray(obj)){
                    metadataList.push(
                        <p key={`${key}: ${obj[key]}`} className="mb-2">
                            <span className="font-semibold">{letraMayuscula(key)}</span>: {obj[key]}
                        </p>
                    )
                }
            } else {
                visualizoMetadata(obj[key])
            }
            if (Array.isArray(obj[key])){
                metadataList.push(
                    <p key={`${key}: ${obj[key]}`} className="mb-2">
                        <span className="font-semibold">{letraMayuscula(key)}</span>: {JSON.stringify(obj[key])}
                    </p>
                )
            }
        }
    }

    if(!description) {
        return <div></div>
    }

    if(isJson(description)) {
        let metadataDesc = JSON.parse(description);
        visualizoMetadata(metadataDesc);
    
        return (
            <div className="mt-2 text-sm">
                <div className="overflow-x-auto">
                    <table className="w-full table-auto border-collapse bg-white dark:bg-gray-800 shadow-md rounded-lg overflow-hidden">
                        <tbody>
                        {
                            [...Array(Math.ceil(metadataList.length/2))].map((item, index) => {
                                return (
                                    <Fragment key={index}>
                                        <tr className="bg-gray-50 dark:bg-gray-700">
                                            <td className="p-3 w-1/2 max-w-[200px] min-w-[150px] whitespace-pre-wrap border-b border-gray-200 dark:border-gray-600">
                                                {metadataList[index * 2]}
                                            </td>
                                            {
                                                ((index*2) + 1) < metadataList.length &&
                                                    <td className="p-3 whitespace-pre-wrap border-b border-gray-200 dark:border-gray-600">
                                                        {metadataList[(index*2) + 1]}
                                                    </td>
                                            }
                                        </tr>
                                    </Fragment>
                                )
                            })
                        }
                        </tbody>
                    </table>
                </div>
            </div>
        )
    }
    else {
        return (
            <p className="text-gray-700 dark:text-gray-300">{description}</p>
        )
    }
}