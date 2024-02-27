// Adds commas to number values
export function addNumberCommas(value: number) {
  var str = value.toString().split(".");
  str[0] = str[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  return str.join(".");
}


export function roundToCurrencyDecimal(value: string, decimalPlaces: number) {
  let newVal = value;
  const regex = new RegExp("^\\d*\\.\\d{" + (decimalPlaces + 1) + ",}$");
  if (regex.test(newVal)) {
    // If it is, round it to the allowed number of decimal places
    newVal = parseFloat(newVal).toFixed(decimalPlaces);
  }
  return newVal;
}

export function maxDP(value: string | number, dp = 3) {
  // *** Check for different types if needed ***

  if(typeof value === "number") {
    let finalValue = value;

    return parseFloat(finalValue.toFixed(dp));
  }

  // *** Also add a ceiling or floor parameter ***

  let finalValue = value;

  return parseFloat(parseFloat(finalValue).toFixed(dp));
}


export function formatValueWithDP(value: string | number, dp = 3) {
  return addNumberCommas(maxDP(value, dp));
}