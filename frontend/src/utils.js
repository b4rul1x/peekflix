export const formatDate = (iso) =>
  iso
    ? new Date(iso).toLocaleDateString('uk-UA', { day: 'numeric', month: 'long', year: 'numeric' })
    : null;

const regionNames = new Intl.DisplayNames(['uk'], { type: 'region' });

export const getCountryName = (code, fallback) => {
  try {
    return regionNames.of(code) || fallback;
  } catch {
    return fallback;
  }
};