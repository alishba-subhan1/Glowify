const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const DATE_REGEX = /^\d{4}-\d{2}-\d{2}$/;

function normalizeEmail(value) {
  return String(value || "").trim().toLowerCase();
}

function isValidEmail(value) {
  return EMAIL_REGEX.test(normalizeEmail(value));
}

function sanitizeText(value, maxLength = 500) {
  return String(value || "").trim().slice(0, maxLength);
}

function isPositiveNumber(value) {
  const number = Number(value);
  return Number.isFinite(number) && number > 0;
}

function isValidDateInput(value) {
  if (!DATE_REGEX.test(String(value || ""))) return false;
  const parsed = new Date(`${value}T00:00:00.000Z`);
  return !Number.isNaN(parsed.getTime());
}

module.exports = {
  normalizeEmail,
  isValidEmail,
  sanitizeText,
  isPositiveNumber,
  isValidDateInput
};
