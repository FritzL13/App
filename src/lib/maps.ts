export function routenLink(firma: string, ort: string): string {
  const adresse = [firma, ort].filter((teil) => teil.trim().length > 0).join(', ');
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(adresse)}`;
}
