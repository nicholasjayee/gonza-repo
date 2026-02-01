
export const formalizeText = (text: string): string => {
  if (!text) return '';
  return text.charAt(0).toUpperCase() + text.slice(1);
};

export const enhanceForBusiness = (text: string): string => {
  // Simple enhancement for now, can be expanded
  const formalized = formalizeText(text);
  if (!formalized.endsWith('.')) return formalized + '.';
  return formalized;
};
