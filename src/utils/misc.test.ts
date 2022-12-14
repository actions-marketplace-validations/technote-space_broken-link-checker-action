/* eslint-disable no-magic-numbers */
import { resolve } from 'path';
import { generateContext, testEnv } from '@technote-space/github-action-test-helper';
import { describe, expect, it } from 'vitest';
import { INTERVAL_MS } from '../constant';
import {
  getArrayValue,
  getNumberValue,
  getBoolValue,
  getStringValue,
  getIssueTitle,
  getIssueBody,
  getHtmlCheckerOptions,
  filterInput,
  getInterval,
} from './misc';

const rootDir = resolve(__dirname, '../..');

describe('getArrayValue', () => {
  testEnv(rootDir);

  it('should return array', () => {
    process.env.INPUT_TEST = '123, 234';
    expect(getArrayValue('test')).toEqual(['123', '234']);
  });

  it('should return undefined', () => {
    expect(getArrayValue('test')).toBeUndefined();
  });
});

describe('getNumberValue', () => {
  testEnv(rootDir);

  it('should return number', () => {
    process.env.INPUT_TEST = '123';
    expect(getNumberValue('test')).toBe(123);
  });

  it('should return undefined', () => {
    process.env.INPUT_TEST = 'aaa';
    expect(getNumberValue('abc')).toBeUndefined();
    expect(getNumberValue('test')).toBeUndefined();
  });
});

describe('getBoolValue', () => {
  testEnv(rootDir);

  it('should return boolean', () => {
    process.env.INPUT_TEST1 = 'true';
    process.env.INPUT_TEST2 = 'false';
    expect(getBoolValue('test1')).toBe(true);
    expect(getBoolValue('test2')).toBe(false);
  });

  it('should return undefined', () => {
    expect(getBoolValue('test')).toBeUndefined();
  });
});

describe('getStringValue', () => {
  testEnv(rootDir);

  it('should return array', () => {
    process.env.INPUT_TEST = '123';
    expect(getStringValue('test')).toBe('123');
  });

  it('should return undefined', () => {
    expect(getStringValue('test')).toBeUndefined();
  });
});

describe('getIssueTitle', () => {
  testEnv(rootDir);

  it('should title', async() => {
    process.env.INPUT_TARGET = 'http://example.com/test';
    process.env.INPUT_TITLE  = '${URL}::${REDIRECTED_URL}::${REASON}::${TARGET}::${OWNER}::${REPO}';
    expect(await getIssueTitle('http://test', generateContext({
      owner: 'hello',
      repo: 'world',
    }))).toBe('http://test::::::http://example.com/test::hello::world');
  });
});

describe('getIssueBody', () => {
  testEnv(rootDir);

  it('should body', async() => {
    process.env.INPUT_TARGET = 'http://example.com/test';
    process.env.INPUT_TITLE  = '${URL}::${REDIRECTED_URL}::${REASON}::${TARGET}::${OWNER}::${REPO}';
    expect(await getIssueBody({
      originalURL: 'http://original',
      redirectedURL: 'http://redirected',
      brokenReasons: { reason1: 'reason1', reason2: 'reason2' },
    }, generateContext({ owner: 'hello', repo: 'world', sha: '1234' }))).toBe(`\
## Broken link found

Broken Link Checker found a broken link on http://example.com/test

  Target: http://original
  > reason1, reason2

  [View Actions Results](https://github.com/hello/world/commit/1234/checks)`);
  });
});

describe('getHtmlCheckerOptions', () => {
  testEnv(rootDir);

  it('should return options', () => {
    process.env.INPUT_EXCLUDE_EXTERNAL_LINKS = 'true';
    process.env.INPUT_EXCLUDE_INTERNAL_LINKS = 'false';
    process.env.INPUT_ACCEPTED_SCHEMES       = 'test1, test2';
    expect(getHtmlCheckerOptions()).toEqual({
      'acceptedSchemes': ['test1', 'test2'],
      'excludeExternalLinks': true,
      'excludeInternalLinks': false,
      'excludedKeywords': [
        'camo.githubusercontent.com',
      ],
      'rateLimit': 1000,
    });
  });
});

describe('filterInput', () => {
  it('should filter input 1', () => {
    expect(filterInput('test', () => '')).toBeUndefined();
  });

  it('should filter input 2', () => {
    process.env.INPUT_TEST = '';
    expect(filterInput('test', () => '')).toBeUndefined();
  });

  it('should filter input 3', () => {
    process.env.INPUT_TEST = '123';
    expect(filterInput('test', () => '123')).toBe('123');
  });
});

describe('getInterval', () => {
  testEnv(rootDir);

  it('should return default 1', () => {
    expect(getInterval()).toBe(INTERVAL_MS);
  });

  it('should return default 2', () => {
    process.env.INPUT_INTERVAL = 'abc';
    expect(getInterval()).toBe(INTERVAL_MS);
  });

  it('should return default 3', () => {
    process.env.INPUT_INTERVAL = '0';
    expect(getInterval()).toBe(INTERVAL_MS);
  });

  it('should return interval', () => {
    process.env.INPUT_INTERVAL = '123';
    expect(getInterval()).toBe(123);
  });
});
