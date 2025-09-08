import Handlebars from 'handlebars';

/**
 * Process a JSON template file with Handlebars.
 * @param jsonContent - The JSON content to process.
 * @param vars - The variables to substitute in the template.
 * @param options - Additional options.
 * @returns The processed JSON object.
 */
export function processTemplate(
  jsonContent: Record<string, any>,
  vars: Record<string, unknown>,
  options: { failOnMissingVariable?: boolean } = {},
): Record<string, any> {
  const { failOnMissingVariable = false } = options;
  const jsonString = JSON.stringify(jsonContent);

  Handlebars.registerHelper('getVar', (key: string) => {
    if (failOnMissingVariable && !(key in vars)) {
      throw new Error(`Missing variable: ${key}`);
    }

    return vars[key] ?? `{{${key}}}`;
  });

  const transformedTemplate = jsonString.replaceAll(/{{\s*([\w.-]+)\s*}}/g, (_, varName) => `{{getVar "${varName}"}}`);

  const template = Handlebars.compile(transformedTemplate, { noEscape: true });
  const output = template(vars);

  return JSON.parse(output) as Record<string, any>;
}
