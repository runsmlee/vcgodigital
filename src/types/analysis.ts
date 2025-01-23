export interface AnalysisInput {
  'Startup Name': string;
  'Email to receive the evaluation result': string;
  File: FileList;
}

export interface Analysis {
  meta: {
    company_name: string;
    industry: string;
  };
  recommendation: {
    rating: string;
  };
  executive_summary: {
    description: string;
    key_metrics: Record<string, string>;
    funding_request: {
      amount: string;
      round: string;
      previous_funding: string;
      [key: string]: string;
    };
  };
  analysis: {
    market: {
      rating: string;
      market_size: {
        tam: string;
      };
      growth_rate: string;
      key_drivers: string[];
    };
  };
}