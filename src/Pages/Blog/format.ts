// The API stores timestamps as UTC "YYYY-MM-DD HH:MM:SS". Normalize that form
// before parsing so the browser does not read it as local time.
export const formatBlogDate = (value: string): string => {
  if (!value) {
    return '';
  }

  const normalized = value.includes('T')
    ? value
    : `${value.replace(' ', 'T')}Z`;
  const parsed = new Date(normalized);

  return Number.isNaN(parsed.getTime())
    ? value
    : parsed.toLocaleDateString(undefined, {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
};
