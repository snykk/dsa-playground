import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { IconButton } from './IconButton';

const render = (disabled: boolean) =>
  renderToStaticMarkup(createElement(IconButton, { icon: 'next', label: 'Next step', onClick: () => {}, disabled }));

describe('IconButton', () => {
  it('stays focusable when disabled, so focus is not dropped to the page', () => {
    const html = render(true);
    expect(html).toContain('aria-disabled="true"');
    expect(html).not.toMatch(/\sdisabled(=|\s|>)/);
  });

  it('says nothing about being disabled when it is enabled', () => {
    expect(render(false)).not.toContain('aria-disabled');
  });
});
