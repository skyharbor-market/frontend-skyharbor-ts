import React, { Fragment } from "react";
import { isJson } from "../../ergofunctions/helpers";

export default function FormattedMetadata({ description }) {
  let metadataList = [];

  function capitalizeFirstLetter(text) {
    return text.charAt(0).toUpperCase() + text.slice(1);
  }
  function visualizeMetadata(obj) {
    for (var key in obj) {
      if (!obj.hasOwnProperty(key)) continue;
      if (typeof obj[key] !== "object") {
        if (key === "image") {
          metadataList.push(
            <p key={`${key}: ${obj[key]}`} className="">
              {capitalizeFirstLetter(key)}:{" "}
              <a href={obj[key]}>{obj[key].substring(8, 30)}</a>
            </p>
          );
        } else if (!Array.isArray(obj)) {
          metadataList.push(
            <p key={`${key}: ${obj[key]}`} className="">
              {capitalizeFirstLetter(key)}: {obj[key]}
            </p>
          );
        }
      } else {
        visualizeMetadata(obj[key]);
      }
      if (Array.isArray(obj[key])) {
        metadataList.push(
          <p key={`${key}: ${obj[key]}`} className="">
            {capitalizeFirstLetter(key)}: {JSON.stringify(obj[key])}
          </p>
        );
      }
    }
  }

  if (!description) {
    return <div></div>;
  }

  if (isJson(description)) {
    let dis = description;
    let metadataDesc = JSON.parse(dis);
    visualizeMetadata(metadataDesc);

    return (
      <div className="mt-2 text-sm">
        <div className="">
          <table className="min-w-full">
            <tbody className="bg-white divide-y divide-gray-600 ">
              {[...Array(Math.ceil(metadataList.length / 2))].map(
                (item, index) => {
                  return (
                    <Fragment key={index}>
                      <tr className="">
                        <td className="py-3 whitespace-pre-wrap w-1/2">
                          {metadataList[index * 2]}
                        </td>
                        {index * 2 + 1 < metadataList.length && (
                          <td className=" py-2 whitespace-pre-wrap">
                            {metadataList[index * 2 + 1]}
                          </td>
                        )}
                      </tr>
                    </Fragment>
                  );
                }
              )}
            </tbody>
          </table>
        </div>
      </div>
    );
  } else {
    return <p>{description}</p>;
  }
}
