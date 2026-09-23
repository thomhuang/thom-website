import type { Image, Root, RootContent } from 'mdast';

const WIDTH_ATTRIBUTE = /^\{width=([^}]+)\}/;
const VALID_WIDTH = /^(?:\d+(?:\.\d+)?(?:px|%|rem|em|vw|vh)|auto)$/;

// Authors size an image by appending {width=50%} after it. Remark leaves that
// as a trailing text node, so fold it into the image and drop the text.
function applyWidth(children: RootContent[], node: Image, index: number) {
  const next = children[index + 1];

  if (!next || next.type !== 'text') {
    return;
  }

  const match = WIDTH_ATTRIBUTE.exec(next.value);

  if (!match) {
    return;
  }

  const width = match[1].trim();

  if (!width || !VALID_WIDTH.test(width)) {
    return;
  }

  const data = (node.data ?? {}) as { hProperties?: Record<string, unknown> };
  node.data = {
    ...data,
    hProperties: { ...data.hProperties, style: `width: ${width};` },
  };

  const rest = next.value.slice(match[0].length);

  if (rest) {
    next.value = rest;
  } else {
    children.splice(index + 1, 1);
  }
}

function walk(children: RootContent[]) {
  for (let index = 0; index < children.length; index += 1) {
    const child = children[index];

    if (child.type === 'image') {
      applyWidth(children, child, index);
    } else if ('children' in child && Array.isArray(child.children)) {
      walk(child.children);
    }
  }
}

export default function remarkImageWidth() {
  return (tree: Root) => {
    walk(tree.children);
  };
}
