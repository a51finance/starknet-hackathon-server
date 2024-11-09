import BigNumber from "bignumber.js";
import { BigNumberish } from "starknet";

interface I32 {
  mag: string;
  sign: number; // 0 for positive, 1 for negative
}

const INT_32_MAX = BigInt(2) ** BigInt(31) - BigInt(1); // Maximum positive value for i32
const INT_32_MIN = -(BigInt(2) ** BigInt(31)); // Minimum value for i32

export const toI32 = (it: BigNumberish): I32 => {
  const bn = BigInt(it);

  if (bn > INT_32_MAX || bn < INT_32_MIN) {
    throw new Error("Number is out of range for i32");
  }

  const sign = bn < BigInt(0) ? 1 : 0;
  const mag = (bn >= BigInt(0) ? bn : -bn).toString(10);

  return { mag, sign };
};

export const fromI32 = (i32: I32): BigInt => {
  const magBigInt = BigInt(i32.mag);

  // Apply the sign: if sign is 1, make it negative; otherwise, keep it positive
  const result = Boolean(i32.sign) === Boolean(1) ? -magBigInt : magBigInt;

  // Check that the result is within i32 range
  if (result > INT_32_MAX || result < INT_32_MIN) {
    throw new Error("Number is out of range for i32");
  }

  return result;
};

export function decimalToHexManual(decimalString) {
  // Initialize a BigNumber with the input decimal string
  let number = new BigNumber(decimalString);
  let hexString = "";
  const hexChars = "0123456789abcdef";
  const sixteen = new BigNumber(16);

  // Continue dividing by 16 and collecting remainders until number is zero
  while (number.gt(0)) {
    const remainder = number.mod(sixteen).toNumber(); // remainder as an integer
    hexString = hexChars[remainder] + hexString; // prepend the hex digit
    number = number.dividedToIntegerBy(sixteen); // divide number by 16, integer part only
  }

  return hexString || "0"; // Return '0' if the initial number was zero
}
