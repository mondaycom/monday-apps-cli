import { parseTemplateVars } from './template-vars';

describe('parseTemplateVars', () => {
  it('should return empty object when input is undefined', () => {
    expect(parseTemplateVars()).toEqual({});
  });

  it('should return empty object when input is empty string', () => {
    expect(parseTemplateVars('')).toEqual({});
  });

  it('should parse single key-value pair', () => {
    expect(parseTemplateVars('KEY=VALUE')).toEqual({
      KEY: 'VALUE',
    });
  });

  it('should parse multiple key-value pairs', () => {
    expect(parseTemplateVars('KEY1=VALUE1,KEY2=VALUE2')).toEqual({
      KEY1: 'VALUE1',
      KEY2: 'VALUE2',
    });
  });

  it('should trim whitespace from keys and values', () => {
    expect(parseTemplateVars(' KEY1 = VALUE1 , KEY2 = VALUE2 ')).toEqual({
      KEY1: 'VALUE1',
      KEY2: 'VALUE2',
    });
  });
});
