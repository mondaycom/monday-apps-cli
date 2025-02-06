/**
 * Parses template variables from a string in the format "KEY=VALUE,KEY2=VALUE2"
 * @param templateVars String containing template variables
 * @returns Object with parsed template variables
 */
export const parseTemplateVars = (templateVars?: string): Record<string, string> => {
  if (!templateVars) {
    return {};
  }

  return Object.fromEntries(
    templateVars.split(',').map(pair => {
      const [key, value] = pair.split('=');
      return [key.trim(), value.trim()];
    }),
  );
};
