import { processTemplate } from 'utils/templating';

describe('processTemplate', () => {
  it('should replace placeholders with provided variables', () => {
    const jsonContent = { name: '{{APP_NAME}}', version: '1.0.0' };
    const vars = { APP_NAME: 'MyCoolApp' };

    const result = processTemplate(jsonContent, vars);

    expect(result).toEqual({ name: 'MyCoolApp', version: '1.0.0' });
  });

  it('should leave placeholders unchanged if variable is missing and failOnMissingVariable is false', () => {
    const jsonContent = { name: '{{APP_NAME}}', version: '{{VERSION}}' };
    const vars = { APP_NAME: 'MyCoolApp' };

    const result = processTemplate(jsonContent, vars, { failOnMissingVariable: false });

    expect(result).toEqual({ name: 'MyCoolApp', version: '{{VERSION}}' });
  });

  it('should throw an error if failOnMissingVariable is true and a variable is missing', () => {
    const jsonContent = { name: '{{APP_NAME}}', version: '{{VERSION}}' };
    const vars = { APP_NAME: 'MyCoolApp' };

    expect(() => processTemplate(jsonContent, vars, { failOnMissingVariable: true })).toThrow(
      'Missing variable: VERSION',
    );
  });

  it('should process deeply nested JSON objects', () => {
    const jsonContent = {
      app: {
        name: '{{APP_NAME}}',
        metadata: { version: '{{VERSION}}' },
      },
    };
    const vars = { APP_NAME: 'NestedApp', VERSION: '2.0.0' };

    const result = processTemplate(jsonContent, vars);

    expect(result).toEqual({
      app: {
        name: 'NestedApp',
        metadata: { version: '2.0.0' },
      },
    });
  });

  it('should process arrays with placeholders', () => {
    const jsonContent = {
      names: ['{{FIRST_NAME}}', '{{LAST_NAME}}'],
    };
    const vars = { FIRST_NAME: 'John', LAST_NAME: 'Doe' };

    const result = processTemplate(jsonContent, vars);

    expect(result).toEqual({
      names: ['John', 'Doe'],
    });
  });

  it('should throw an error if JSON parsing fails after template processing', () => {
    const jsonContent = { value: '{{INVALID_JSON}}' };
    const vars = { INVALID_JSON: '{"unclosed": "object"' };

    expect(() => processTemplate(jsonContent, vars)).toThrow(/Expected ',' or '}' after property value/);
  });
});
