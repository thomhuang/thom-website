import { render, screen } from '@testing-library/react';
import { describe, expect, test } from 'vitest';

import MarkdownBody from './MarkdownBody';

describe('MarkdownBody', () => {
  test('turns an image-only paragraph into captioned figures', () => {
    render(
      <MarkdownBody markdown="![Facade at dawn](https://img.test/a.webp) ![The roaster](https://img.test/b.webp)" />
    );

    const figures = screen.getAllByRole('figure');
    expect(figures).toHaveLength(2);
    expect(screen.getByText('Facade at dawn')).toBeInTheDocument();
    expect(screen.getByText('The roaster')).toBeInTheDocument();
    expect(screen.getByAltText('Facade at dawn')).toHaveAttribute(
      'src',
      'https://img.test/a.webp'
    );
  });

  test('treats images on separate lines as one row', () => {
    render(
      <MarkdownBody markdown={'![One](https://img.test/a.webp)\n![Two](https://img.test/b.webp)'} />
    );

    expect(screen.getAllByRole('figure')).toHaveLength(2);
  });

  test('gives a lone image a caption without a row', () => {
    render(<MarkdownBody markdown="![Solo](https://img.test/a.webp)" />);

    expect(screen.getAllByRole('figure')).toHaveLength(1);
    expect(screen.getByText('Solo')).toBeInTheDocument();
  });

  test('keeps prose with an inline image as a paragraph', () => {
    render(
      <MarkdownBody markdown="Look at this ![A photo](https://img.test/a.webp) closely." />
    );

    expect(screen.queryByRole('figure')).not.toBeInTheDocument();
    expect(screen.getByRole('img', { name: 'A photo' })).toBeInTheDocument();
  });

  test('omits the caption when alt text is empty', () => {
    render(<MarkdownBody markdown="![](https://img.test/a.webp)" />);

    expect(screen.getAllByRole('figure')).toHaveLength(1);
    expect(screen.queryByRole('figure')).not.toHaveTextContent(/\S/);
  });

  test('gives headings a slug id so jump links resolve', () => {
    render(
      <MarkdownBody markdown={'[Jump to gear](#jump-to-gear)\n\n## Jump To Gear'} />
    );

    expect(screen.getByRole('heading', { name: 'Jump To Gear' })).toHaveAttribute(
      'id',
      'jump-to-gear'
    );
    expect(screen.getByRole('link', { name: 'Jump to gear' })).toHaveAttribute(
      'href',
      '#jump-to-gear'
    );
  });

  test('slugs heading text that contains inline markup', () => {
    render(<MarkdownBody markdown="## The **Best** Gear?" />);

    expect(screen.getByRole('heading', { level: 2 })).toHaveAttribute(
      'id',
      'the-best-gear'
    );
  });
});
