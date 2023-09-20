import React from "react";

export default function LoadingCircle(props) {
  return (
    <div
      mt="6"
      isIndeterminate
      size={props.size ? props.size : "120px"}
      color="#3182ce"
      thickness="6px"
    />
  );
}
