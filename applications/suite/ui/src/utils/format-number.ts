import removeTrailingZeros from "remove-trailing-zeros";

export const formatNumber = (value: string | number) => {
  return removeTrailingZeros(Number(value).toFixed(8));
};
