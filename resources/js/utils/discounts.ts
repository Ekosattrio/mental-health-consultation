import { ConsultationPackage } from '../types';

export type PackageDiscountResult = {
  code: string;
  label: string;
  amount: number;
  type: 'PERCENT' | 'FIXED';
  value: number;
};

export const calculatePackageDiscount = (
  pkg: ConsultationPackage | undefined
): PackageDiscountResult | null => {
  if (!pkg || !pkg.discountType || pkg.discountType === 'NONE') return null;

  const basePrice = Math.max(pkg.price || 0, 0);
  const value = Math.max(pkg.discountValue || 0, 0);
  if (basePrice <= 0 || value <= 0) return null;

  const rawAmount = pkg.discountType === 'PERCENT'
    ? Math.floor(basePrice * (Math.min(value, 100) / 100))
    : value;
  const amount = Math.min(Math.max(rawAmount, 0), basePrice);
  if (amount <= 0) return null;

  return {
    code: 'PSIKOLOG_POLICY',
    label: pkg.discountLabel?.trim() || 'Potongan dari psikolog/pengelola',
    amount,
    type: pkg.discountType,
    value
  };
};

export const calculatePackagePayableAmount = (pkg: ConsultationPackage | undefined) => {
  const subtotalAmount = Math.max(pkg?.price || 0, 0);
  const discount = calculatePackageDiscount(pkg);
  const discountAmount = discount?.amount || 0;
  const totalAmount = Math.max(subtotalAmount - discountAmount, 0);

  return {
    subtotalAmount,
    discount,
    discountAmount,
    totalAmount
  };
};
