export const wrapInBox = (textToWrap: string): string => {
  const line = '─'.repeat(textToWrap.length + 2);
  const traceIdBox = `┌${line}┐\n  │ ${textToWrap} │\n  └${line}┘`;
  return traceIdBox;
};
