export const feasibilityTestCases = {
  excellent: {
    score: 92,
    dishType: 'Dessert'
  },
  good: {
    score: 75,
    dishType: 'Main Course'
  },
  poor: {
    score: 45,
    dishType: 'Soup'
  }
};

export const criticalErrorsTestCases = {
  errors: [
    {
      code: 'RAW_MEAT_DANGER',
      message: 'Raw meat detected without cooking step',
      severity: 'error' as const
    },
    {
      code: 'MISSING_INGREDIENTS',
      message: 'Recipe mentions salt but not in list',
      severity: 'warning' as const
    }
  ]
};

export const warningsTestCases = {
  warnings: [
    {
      code: 'NO_TEMPERATURE',
      message: 'Cooking temperature not specified',
      severity: 'warning' as const
    },
    {
      code: 'SHORT_INSTRUCTIONS',
      message: 'Instructions are very brief',
      severity: 'info' as const
    }
  ]
};

export const technologyCardTestData = [
  {
    step_number: 1,
    action: 'Prep vegetables',
    description: 'Chop everything into 1cm cubes',
    duration_minutes: 10,
    temperature: null,
    technique: 'chopping',
    ingredients_used: ['carrots', 'onions']
  },
  {
    step_number: 2,
    action: 'Sauté',
    description: 'Sauté until golden brown',
    duration_minutes: 5,
    temperature: '180C',
    technique: 'frying',
    ingredients_used: ['onions', 'oil']
  }
];

export const recommendationsTestData = [
  {
    suggestion_type: 'improvement',
    title: 'Add herbs',
    description: 'Fresh basil would improve the aroma',
    impact: 'taste',
    confidence: 0.9
  }
];

export const businessMetricsTestCases = {
  profitable: {
    cost: 15.5,
    margin: 35,
    haccp_risk: 'low' as const,
    complexity: 2
  },
  marginal: {
    cost: 25.0,
    margin: 12,
    haccp_risk: 'medium' as const,
    complexity: 3
  },
  complex: {
    cost: 45.0,
    margin: 40,
    haccp_risk: 'high' as const,
    complexity: 5
  }
};

export const testCallbacks = {
  onFixError: (code: string) => console.log('Fixing error:', code),
  onAutoFix: (code: string) => console.log('Auto-fixing warning:', code)
};
