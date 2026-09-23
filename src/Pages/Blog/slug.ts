import { isValidElement, type ReactNode } from 'react';

export const slugifyHeading = (text: string): string =>
  text
    .trim()
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s-]/gu, '')
    .replace(/\s+/g, '-');

export const headingText = (node: ReactNode): string => {
  if (typeof node === 'string' || typeof node === 'number') {
    return String(node);
  }

  if (Array.isArray(node)) {
    return node.map(headingText).join('');
  }

  if (isValidElement<{ children?: ReactNode }>(node)) {
    return headingText(node.props.children);
  }

  return '';
};
