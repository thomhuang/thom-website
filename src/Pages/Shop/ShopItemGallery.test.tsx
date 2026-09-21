import { useState } from 'react';

import { render, screen, within, fireEvent, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, test, vi } from 'vitest';

import type { ShopImage } from '../../api/Shop/ShopRouter';
import ShopItemGallery from './ShopItemGallery';

const makeImage = (id: string, url: string): ShopImage => ({
  id,
  objectKey: id,
  url,
  altText: '',
  sortOrder: 0,
});

const ONE_IMAGE = [makeImage('1', '/one.jpg')];
const TWO_IMAGES = [makeImage('1', '/one.jpg'), makeImage('2', '/two.jpg')];

type GalleryOverrides = Partial<Parameters<typeof ShopItemGallery>[0]>;

const renderGallery = (overrides: GalleryOverrides = {}) =>
  render(
    <ShopItemGallery
      images={ONE_IMAGE}
      title="Alpha Jacket"
      selectedImageUrl="/one.jpg"
      failedImageUrl=""
      onSelectImage={vi.fn()}
      onImageError={vi.fn()}
      {...overrides}
    />
  );

// Mirrors how ShopItem controls the selected image, so navigation actually
// re-renders the lightbox image.
function ControlledGallery({ images }: { images: ShopImage[] }) {
  const [selectedImageUrl, setSelectedImageUrl] = useState(images[0].url);

  return (
    <ShopItemGallery
      images={images}
      title="Alpha Jacket"
      selectedImageUrl={selectedImageUrl}
      failedImageUrl=""
      onSelectImage={setSelectedImageUrl}
      onImageError={vi.fn()}
    />
  );
}

const zoomButton = () =>
  screen.getByRole('button', { name: 'View Alpha Jacket full size' });

const lightboxImage = () =>
  within(screen.getByRole('dialog')).getByRole('img', { name: 'Alpha Jacket' });

describe('ShopItemGallery', () => {
  test('opens the full-size view when the image is clicked', async () => {
    const user = userEvent.setup();
    renderGallery();

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();

    await user.click(zoomButton());

    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(
      screen.getAllByRole('img', { name: 'Alpha Jacket' })
    ).toHaveLength(2);
  });

  test('closes the full-size view on Escape', async () => {
    const user = userEvent.setup();
    renderGallery();

    await user.click(zoomButton());
    await user.keyboard('{Escape}');

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  test('closes the full-size view via the Close button', async () => {
    const user = userEvent.setup();
    renderGallery();

    await user.click(zoomButton());
    await user.click(screen.getByRole('button', { name: 'Close' }));

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  test('shows a placeholder and no zoom button without an image', () => {
    renderGallery({ images: [], selectedImageUrl: '', failedImageUrl: '' });

    expect(screen.getByText('No image')).toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: /full size/ })
    ).not.toBeInTheDocument();
  });

  test('hides the arrows when there is only one image', async () => {
    const user = userEvent.setup();
    renderGallery();

    await user.click(zoomButton());

    expect(
      screen.queryByRole('button', { name: 'Next image' })
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: 'Previous image' })
    ).not.toBeInTheDocument();
  });

  test('steps between images with the arrows', async () => {
    const user = userEvent.setup();
    render(<ControlledGallery images={TWO_IMAGES} />);

    await user.click(zoomButton());
    expect(lightboxImage()).toHaveAttribute('src', '/one.jpg');

    await user.click(screen.getByRole('button', { name: 'Next image' }));
    expect(lightboxImage()).toHaveAttribute('src', '/two.jpg');

    await user.click(screen.getByRole('button', { name: 'Previous image' }));
    expect(lightboxImage()).toHaveAttribute('src', '/one.jpg');
  });

  test('navigates with the arrow keys, wrapping around', async () => {
    const user = userEvent.setup();
    render(<ControlledGallery images={TWO_IMAGES} />);

    await user.click(zoomButton());
    await user.keyboard('{ArrowLeft}');

    expect(lightboxImage()).toHaveAttribute('src', '/two.jpg');
  });

  test('locks page scroll while the full-size view is open', async () => {
    const user = userEvent.setup();
    renderGallery();

    await user.click(zoomButton());
    expect(document.body.style.overflow).toBe('hidden');

    await user.click(screen.getByRole('button', { name: 'Close' }));
    expect(document.body.style.overflow).not.toBe('hidden');
  });

  test('magnifies the image while the pointer is held, resetting on release', async () => {
    const user = userEvent.setup();
    renderGallery();

    await user.click(zoomButton());

    vi.useFakeTimers();
    try {
      fireEvent.pointerDown(lightboxImage(), {
        button: 0,
        isPrimary: true,
        pointerId: 1,
      });
      expect(lightboxImage()).not.toHaveAttribute('data-zoomed');

      act(() => {
        vi.advanceTimersByTime(300);
      });
      expect(lightboxImage()).toHaveAttribute('data-zoomed', 'true');

      fireEvent.pointerUp(lightboxImage(), { pointerId: 1 });
      expect(lightboxImage()).not.toHaveAttribute('data-zoomed');
    } finally {
      vi.useRealTimers();
    }
  });
});
