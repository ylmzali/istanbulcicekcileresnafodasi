import {
  digitsOnlyInput,
  isValidPhoneTr,
  normalizePhoneTr,
} from "@/lib/input-formats";
import {
  isValidIdentityNo,
  isValidTaxNo,
  normalizeIdentityNo,
  normalizeTaxNo,
} from "@/lib/tr-identity";

export { digitsOnlyInput };

export const memberValidationMessages = {
  required: "Bu alan zorunludur.",
  email: "Geçerli bir e-posta adresi girin.",
  passwordRequired: "Şifre zorunludur.",
  passwordMin: "Şifre en az 8 karakter olmalıdır.",
  identityNoRequired: "T.C. kimlik numarası zorunludur.",
  identityNo: "Geçerli bir T.C. kimlik numarası girin.",
  taxNoRequired: "Vergi numarası zorunludur.",
  taxNo: "Vergi numarası 10 veya 11 haneli olmalıdır.",
  districtRequired: "İlçe seçimi zorunludur.",
  postalCode: "Posta kodu 5 haneli olmalıdır.",
  phoneRequired: "Telefon numarası zorunludur.",
  phone: "Geçerli bir telefon numarası girin (05xx… veya alan kodlu hat).",
} as const;

export function validateRequired(value: string) {
  return value.trim() ? null : memberValidationMessages.required;
}

export function validateOptionalEmail(value: string) {
  const trimmed = value.trim();
  if (!trimmed) return null;
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
    return memberValidationMessages.email;
  }
  return null;
}

export function validatePassword(value: string, { required = true } = {}) {
  if (!value) {
    return required ? memberValidationMessages.passwordRequired : null;
  }
  if (value.length < 8) return memberValidationMessages.passwordMin;
  return null;
}

export function validateIdentityNo(
  value: string,
  { required = false }: { required?: boolean } = {},
) {
  const digits = normalizeIdentityNo(value);
  if (!digits) {
    return required ? memberValidationMessages.identityNoRequired : null;
  }
  if (!isValidIdentityNo(digits)) return memberValidationMessages.identityNo;
  return null;
}

export function validateTaxNo(
  value: string,
  { required = false }: { required?: boolean } = {},
) {
  const digits = normalizeTaxNo(value);
  if (!digits) {
    return required ? memberValidationMessages.taxNoRequired : null;
  }
  if (!isValidTaxNo(digits)) return memberValidationMessages.taxNo;
  return null;
}

export function validatePhone(
  value: string,
  { required = false }: { required?: boolean } = {},
) {
  const digits = normalizePhoneTr(value);
  if (!digits) {
    return required ? memberValidationMessages.phoneRequired : null;
  }
  if (!isValidPhoneTr(digits)) return memberValidationMessages.phone;
  return null;
}

export function validateDistrict(value: string) {
  return value.trim() ? null : memberValidationMessages.districtRequired;
}

export function validateOptionalPostalCode(value: string) {
  const digits = value.replace(/\D/g, "");
  if (!digits) return null;
  if (!/^\d{5}$/.test(digits)) return memberValidationMessages.postalCode;
  return null;
}

export function hasFieldErrors(
  errors: Record<string, string | null | undefined>,
) {
  return Object.values(errors).some(Boolean);
}

/** Human-readable “why can’t submit” lines: "Ad — Bu alan zorunludur." */
export function buildValidationSummary(
  errors: Record<string, string | null | undefined>,
  fieldLabels: Record<string, string>,
  fieldOrder: string[],
) {
  const details: string[] = [];
  for (const key of fieldOrder) {
    const message = errors[key];
    if (!message) continue;
    const label = fieldLabels[key] ?? key;
    details.push(`${label} — ${message}`);
  }
  for (const [key, message] of Object.entries(errors)) {
    if (!message || fieldOrder.includes(key)) continue;
    const label = fieldLabels[key] ?? key;
    details.push(`${label} — ${message}`);
  }
  if (details.length === 0) return null;
  return {
    title: "Form gönderilemedi. Aşağıdaki alanları düzeltin:",
    details,
  };
}
