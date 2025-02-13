import { fixture } from '@open-wc/testing-helpers';
import { screen } from 'testing-library/dom';
import '../Scrollmeter';

// https://stackoverflow.com/a/50793993
jest.useFakeTimers();

describe('lfp-scrollmeter', async () => {
  beforeEach(async () => {
    await fixture('<lfp-scrollmeter></lfp-scrollmeter>');
  });
  it('have an element with class meter', () => {
    expect(screen.getByRole('div')).toBeDefined();
  });
});