import { PROJECT_TEMPLATES } from 'consts/scaffold';

describe('app:scaffold command', () => {
  describe('PROJECT_TEMPLATES', () => {
    it('should have valid project templates', () => {
      expect(PROJECT_TEMPLATES).toBeDefined();
      expect(PROJECT_TEMPLATES.length).toBeGreaterThan(0);
      expect(PROJECT_TEMPLATES[0]).toHaveProperty('name');
    });

    it('should have templates with setup documentation', () => {
      const template = PROJECT_TEMPLATES.find(p => p.name === 'slack-node');
      expect(template).toBeDefined();
      expect(template?.openSetupMd).toBe(true);
    });
  });
});
