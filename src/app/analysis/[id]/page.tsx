'use client';

import { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { useTheme } from 'next-themes';
import {
  Card,
  Title,
  Text,
  TabGroup,
  TabList,
  Tab,
  TabPanels,
  TabPanel,
  Grid,
  Col,
  Metric,
  ProgressBar,
  BadgeDelta,
  DonutChart,
  BarChart,
  LineChart,
  AreaChart,
  Color,
  Legend,
  Flex,
  Bold,
  Badge,
} from '@tremor/react';
import {
  TrendingUp,
  Users,
  DollarSign,
  Calendar,
  Target,
  AlertTriangle,
  CheckCircle2,
  Activity,
  BarChart as BarChartIcon,
  PieChart,
  Layers,
  Zap,
  Shield,
  Users2,
  LineChart as LineChartIcon,
  AlertCircle,
  ArrowRight,
  ChevronRight,
  Zap as ZapIcon,
  ArrowLeft,
  Globe,
  Loader2,
} from 'lucide-react';
import { useRouter } from 'next/navigation';

interface TeamMember {
  role: string;
  name: string;
  background: string;
  status: 'active' | 'planned';
}

interface HiringPlan {
  role: string;
  priority: 'high' | 'medium' | 'low';
  timeline: string;
}

interface Competitor {
  name: string;
  type: 'direct' | 'indirect';
  key_strength: string | string[];
  market_share?: string;
}

interface RiskFactor {
  category: 'market' | 'technical' | 'financial' | 'regulatory' | 'team';
  description: string;
  severity: 'high' | 'medium' | 'low';
  mitigation_plan: string;
}

interface DueDiligence {
  area: string;
  requirements: string[];
  priority: 'high' | 'medium' | 'low';
}

interface Condition {
  requirement: string;
  priority: 'high' | 'medium' | 'low';
}

const valueFormatter = (number: number) => 
  `$ ${Intl.NumberFormat('us').format(number).toString()}`;

const percentFormatter = (number: number) => `${number}%`;

function StatusBadge({ status, label }: { status: string; label?: string }) {
  if (!status) return null;
  
  const rating = parseInt(status.split('/')[0]);
  
  const getBadgeStyle = (rating: number) => {
    if (rating >= 9) return 'bg-gradient-to-r from-emerald-500/90 to-emerald-600/90 text-white border-emerald-400/20';
    if (rating >= 7) return 'bg-gradient-to-r from-blue-500/90 to-blue-600/90 text-white border-blue-400/20';
    if (rating >= 5) return 'bg-gradient-to-r from-amber-500/90 to-amber-600/90 text-white border-amber-400/20';
    if (rating >= 3) return 'bg-gradient-to-r from-orange-500/90 to-orange-600/90 text-white border-orange-400/20';
    return 'bg-gradient-to-r from-red-500/90 to-red-600/90 text-white border-red-400/20';
  };

  const getRatingText = (rating: number) => {
    if (rating >= 9) return 'Exceptional';
    if (rating >= 7) return 'Strong';
    if (rating >= 5) return 'Adequate';
    if (rating >= 3) return 'Weak';
    return 'Poor';
  };

  const getRatingEmoji = (rating: number) => {
    if (rating >= 9) return '🏆';
    if (rating >= 7) return '💫';
    if (rating >= 5) return '✓';
    if (rating >= 3) return '⚠️';
    return '⛔';
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative group"
    >
      <div className={`flex items-center px-4 py-2 rounded-xl ${getBadgeStyle(rating)} border shadow-lg backdrop-blur-sm transition-all duration-300 hover:shadow-xl hover:scale-105`}>
        <div className="flex items-center space-x-2">
          <span className="text-base">{getRatingEmoji(rating)}</span>
          <span className="text-sm font-medium">{status}</span>
          <span className="text-xs text-white/80">({getRatingText(rating)})</span>
        </div>
      </div>
      <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
    </motion.div>
  );
}

function MetricTile({ 
  title, 
  value, 
  trend,
  icon: Icon,
  description,
  color = "blue",
}: { 
  title: string;
  value: string;
  trend?: string;
  icon: any;
  description?: string;
  color?: Color;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="relative overflow-hidden transition-all duration-300 hover:shadow-lg hover:scale-[1.02] bg-gradient-to-br from-background to-muted/50">
        <div className="absolute top-0 right-0 mt-4 mr-4 opacity-10">
          <Icon className="w-16 h-16" />
        </div>
        <div className="space-y-4">
          <Text className="text-sm font-medium text-muted-foreground uppercase tracking-wide">{title}</Text>
          <div className="flex items-baseline space-x-2">
            <Metric className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/80">{value}</Metric>
            {trend && (
              <BadgeDelta deltaType="increase" size="xs">
                {trend}
              </BadgeDelta>
            )}
          </div>
          {description && (
            <Text className="text-sm text-muted-foreground/80">{description}</Text>
          )}
        </div>
      </Card>
    </motion.div>
  );
}

function InsightCard({ title, insights }: { title: string; insights: string[] }) {
  if (!insights || !Array.isArray(insights)) return null;
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <Card className="bg-gradient-to-br from-background to-muted/30 backdrop-blur-sm transition-all duration-300 hover:shadow-lg">
        <Title className="mb-6 text-xl font-semibold bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/80">{title}</Title>
        <div className="space-y-4">
          {insights.map((insight, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="flex items-start space-x-3 group"
            >
              <ChevronRight className="w-5 h-5 text-primary mt-0.5 flex-shrink-0 transition-transform duration-300 group-hover:translate-x-1" />
              <Text className="text-muted-foreground group-hover:text-foreground transition-colors duration-300">{insight}</Text>
            </motion.div>
          ))}
        </div>
      </Card>
    </motion.div>
  );
}

function RiskPotentialBadge({ rating_risk, rating_potential }: { rating_risk: string; rating_potential: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="flex flex-row items-center space-x-4"
    >
      <div className="flex items-center space-x-2">
        <Text className="text-sm text-muted-foreground">Risk</Text>
        <div className={`px-3 py-1 rounded-full text-sm font-medium shadow-soft-sm transition-all duration-300 hover:shadow-soft-md
          ${rating_risk === 'Low' ? 'bg-emerald-500 text-white' : 
            rating_risk === 'Moderate' ? 'bg-amber-500 text-white' : 
            'bg-red-500 text-white'}`}>
          {rating_risk}
        </div>
      </div>
      <div className="flex items-center space-x-2">
        <Text className="text-sm text-muted-foreground">Potential</Text>
        <div className={`px-3 py-1 rounded-full text-sm font-medium shadow-soft-sm transition-all duration-300 hover:shadow-soft-md
          ${rating_potential === 'High' ? 'bg-emerald-500 text-white' : 
            rating_potential === 'Moderate' ? 'bg-blue-500 text-white' : 
            'bg-gray-500 text-white'}`}>
          {rating_potential}
        </div>
      </div>
    </motion.div>
  );
}

// 숫자 변환 유틸리티 함수들 개선
const convertToMillions = (value: string): number => {
  if (!value || value === '0') return 0;
  
  try {
    const isNegative = value.startsWith('-');
    const numStr = value.replace(/[^0-9.]/g, '');
    const num = parseFloat(numStr);
    if (isNaN(num)) return 0;
    
    let result = num;
    if (value.toLowerCase().includes('b')) {
      result = num * 1000;
    } else if (value.toLowerCase().includes('k')) {
      result = num / 1000;
    }
    
    return isNegative ? -result : result;
  } catch (error) {
    console.error('Error converting value:', value, error);
    return 0;
  }
};

// 금액 변환 유틸리티 함수 개선
const formatCurrencyValue = (value: string | undefined | null): string => {
  if (value === undefined || value === null || value === '') return 'No data';
  if (value === '0') return '$0';
  
  try {
    const num = parseFloat(value);
    if (isNaN(num)) return 'No data';
    
    // 단위 자동 변환
    if (num >= 1000000000) {
      return `$${(num / 1000000000).toFixed(1)}B`;
    }
    if (num >= 1000000) {
      return `$${(num / 1000000).toFixed(1)}M`;
    }
    if (num >= 1000) {
      return `$${(num / 1000).toFixed(1)}K`;
    }
    
    return `$${num.toFixed(0)}`;
  } catch (error) {
    console.error('Error formatting currency value:', error);
    return 'No data';
  }
};

// 재무 데이터 변환 함수 개선
const convertFinancialValue = (value: string): number => {
  if (!value || value === '0') return 0;
  
  try {
    const num = parseFloat(value);
    if (isNaN(num)) return 0;
    
    return num;  // 원래 값 그대로 반환
  } catch (error) {
    console.error('Error converting financial value:', error);
    return 0;
  }
};

// 재무 데이터 표시용 포맷터 함수 개선
const financialFormatter = (value: number): string => {
  if (typeof value !== 'number' || isNaN(value)) return '$0';
  
  const absValue = Math.abs(value);
  if (absValue >= 1000000000) {
    return `$${(value/1000000000).toFixed(1)}B`;
  }
  if (absValue >= 1000000) {
    return `$${(value/1000000).toFixed(1)}M`;
  }
  if (absValue >= 1000) {
    return `$${(value/1000).toFixed(1)}K`;
  }
  return `$${value.toFixed(0)}`;
};

// 마켓 사이즈 데이터용 포맷터 함수 개선
const marketSizeFormatter = (value: number): string => {
  if (typeof value !== 'number' || isNaN(value)) return '$0';
  
  const absValue = Math.abs(value);
  if (absValue >= 1000000000000) {
    return `$${(value/1000000000000).toFixed(1)}T`;
  }
  if (absValue >= 1000000000) {
    return `$${(value/1000000000).toFixed(1)}B`;
  }
  if (absValue >= 1000000) {
    return `$${(value/1000000).toFixed(1)}M`;
  }
  if (absValue >= 1000) {
    return `$${(value/1000).toFixed(0)}K`;
  }
  return `$${value.toFixed(0)}`;
};

// 재무 데이터 변환 및 누적 현금흐름 계산 함수 개선
const calculateFinancialData = (financials: any) => {
  const years = financials.projections.years;
  const revenues = financials.projections.revenue;
  const costs = financials.projections.costs;
  let accumulatedCashFlow = 0;

  return years.map((year: string, index: number) => {
    const revenue = convertFinancialValue(revenues[index]);
    const cost = convertFinancialValue(costs[index]);
    const netCashFlow = revenue - cost;
    accumulatedCashFlow += netCashFlow;

    return {
      year,
      Revenue: revenue,
      Costs: cost,
      "Accumulated Cash Flow": accumulatedCashFlow
    };
  });
};

// Add new components for additional sections
function CompetitorCard({ competitor }: { competitor: Competitor }) {
  const renderStrengths = () => {
    if (Array.isArray(competitor.key_strength)) {
      return competitor.key_strength.map((strength: string, idx: number) => (
        <div key={idx} className="flex items-start space-x-2">
          <ArrowRight className="w-4 h-4 text-blue-500 mt-1" />
          <Text className="text-sm text-gray-600">{strength}</Text>
        </div>
      ));
    }
    
    return competitor.key_strength.split(';').map((strength: string, idx: number) => (
      <div key={idx} className="flex items-start space-x-2">
        <ArrowRight className="w-4 h-4 text-blue-500 mt-1" />
        <Text className="text-sm text-gray-600">{strength.trim()}</Text>
      </div>
    ));
  };

  return (
    <Card className="bg-white dark:bg-gray-800 h-full">
      <div className="flex flex-col h-full">
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-lg p-4 mb-4">
          <Title className="text-lg text-blue-800 dark:text-blue-200 mb-1">{competitor.name}</Title>
          <Text className="text-sm text-blue-600 dark:text-blue-300">{competitor.type}</Text>
        </div>
        <div className="flex-1">
          {competitor.key_strength && (
            <div className="space-y-1">
              {renderStrengths()}
            </div>
          )}
          {competitor.market_share && competitor.market_share !== '0' && (
            <div className="mt-4">
              <Text className="font-medium text-gray-700">Market Share</Text>
              <Text className="text-sm text-gray-600">{formatMarketShare(competitor.market_share)}</Text>
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}

function RiskCard({ risk }: { risk: any }) {
  const getSeverityColor = (severity: string) => {
    const normalizedSeverity = severity.toLowerCase();
    switch (normalizedSeverity) {
      case 'high':
        return 'bg-red-500 dark:bg-red-400';
      case 'medium':
        return 'bg-amber-500 dark:bg-amber-400';
      case 'low':
        return 'bg-blue-500 dark:bg-blue-400';
      default:
        return 'bg-gray-500 dark:bg-gray-400';
    }
  };

  const getSeverityBadgeStyle = (severity: string) => {
    const normalizedSeverity = severity.toLowerCase();
    switch (normalizedSeverity) {
      case 'high':
        return 'bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-400';
      case 'medium':
        return 'bg-amber-50 text-amber-700 dark:bg-amber-900/20 dark:text-amber-400';
      case 'low':
        return 'bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400';
      default:
        return 'bg-gray-50 text-gray-600 dark:bg-gray-900/20 dark:text-gray-400';
    }
  };

  return (
    <Card className="bg-white dark:bg-gray-800 rounded-lg">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className={`w-3 h-3 rounded-full ${getSeverityColor(risk.severity)}`} />
            <Text className="font-medium capitalize">{risk.category} Risk</Text>
          </div>
          <Badge 
            className={getSeverityBadgeStyle(risk.severity)}
            size="xs"
          >
            {risk.severity} severity
          </Badge>
        </div>
        <Text className="text-sm text-gray-600">{risk.description}</Text>
        <div className="pt-2 border-t border-gray-200 dark:border-gray-700">
          <Text className="text-xs text-gray-500 mb-1">Mitigation Plan</Text>
          <Text className="text-sm">{risk.mitigation_plan}</Text>
        </div>
      </div>
    </Card>
  );
}

// Add new component for unit economics visualization
function UnitEconomicsCard({ title, current, target, type = "currency" }: { 
  title: string; 
  current: string | undefined; 
  target: string | undefined;
  type?: "currency" | "percentage";
}) {
  if (!current || !target) return null;

  const currentValue = parseFloat(current.replace(/[^0-9.]/g, ''));
  const targetValue = parseFloat(target.replace(/[^0-9.]/g, ''));
  
  if (isNaN(currentValue) || isNaN(targetValue)) return null;
  
  const maxValue = Math.max(currentValue, targetValue);
  
  const formatValue = (value: string) => {
    if (type === "currency") {
      return formatCurrencyValue(value);
    }
    return value.endsWith('%') ? value : `${value}%`;
  };

  return (
    <Card className="bg-white dark:bg-gray-800">
      <Text className="font-medium mb-4">{title}</Text>
      <div className="space-y-6">
        <div>
          <div className="flex items-center justify-between mb-2">
            <Text className="text-sm text-gray-500">Current</Text>
            <Text className="font-medium">{formatValue(current)}</Text>
          </div>
          <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
            <div 
              className="h-full bg-blue-600 rounded-full transition-all duration-500"
              style={{ width: `${(currentValue / maxValue) * 100}%` }}
            />
          </div>
        </div>
        <div>
          <div className="flex items-center justify-between mb-2">
            <Text className="text-sm text-gray-500">Target</Text>
            <Text className="font-medium">{formatValue(target)}</Text>
          </div>
          <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
            <div 
              className="h-full bg-emerald-600 rounded-full transition-all duration-500"
              style={{ width: `${(targetValue / maxValue) * 100}%` }}
            />
          </div>
        </div>
      </div>
    </Card>
  );
}

// Market Size 시각화 컴포넌트 수정
function MarketSizeVenn({ tam, sam, som }: { tam: string; sam: string; som: string }) {
  return (
    <div className="relative h-80 flex items-center justify-center">
      <div className="absolute w-72 h-72 rounded-full bg-blue-100/80 dark:bg-blue-900/20 flex flex-col items-center">
        <div className="-mt-2">
          <div className="flex items-center space-x-2">
            <Text className="text-lg font-medium text-blue-600 dark:text-blue-400">TAM</Text>
            <Text className="text-sm text-blue-600 dark:text-blue-400">{formatCurrencyValue(tam)}</Text>
          </div>
        </div>
      </div>
      <div className="absolute w-52 h-52 rounded-full bg-indigo-100/80 dark:bg-indigo-900/20 flex flex-col items-center">
        <div className="-mt-0">
          <div className="flex items-center space-x-2">
            <Text className="text-lg font-medium text-indigo-600 dark:text-indigo-400">SAM</Text>
            <Text className="text-sm text-indigo-600 dark:text-indigo-400">{formatCurrencyValue(sam)}</Text>
          </div>
        </div>
      </div>
      <div className="absolute w-32 h-32 rounded-full bg-purple-100/80 dark:bg-purple-900/20 flex flex-col items-center justify-center">
        <div className="flex items-center space-x-2">
          <Text className="text-lg font-medium text-purple-600 dark:text-purple-400">SOM</Text>
          <Text className="text-sm text-purple-600 dark:text-purple-400">{formatCurrencyValue(som)}</Text>
        </div>
      </div>
    </div>
  );
}

// Badge 스타일 개선을 위한 유틸리티 함수
const getBadgeStyle = (color: string, isBackground: boolean = true) => {
  const styles = {
    red: isBackground ? 'bg-red-600 text-white' : 'bg-red-50 text-red-700',
    amber: isBackground ? 'bg-amber-600 text-white' : 'bg-amber-50 text-amber-600',
    blue: isBackground ? 'bg-blue-600 text-white' : 'bg-blue-50 text-blue-700',
    emerald: isBackground ? 'bg-emerald-600 text-white' : 'bg-emerald-50 text-emerald-700',
    purple: isBackground ? 'bg-purple-600 text-white' : 'bg-purple-50 text-purple-700',
    white: 'bg-white/50 dark:bg-white/20',
  };
  return styles[color as keyof typeof styles] || styles.blue;
};

// Priority/Severity 뱃지 스타일 함수 수정
const getPriorityBadgeStyle = (priority: string) => {
  const normalizedPriority = priority.toLowerCase();
  switch (normalizedPriority) {
    case 'high':
      return 'bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-400';
    case 'medium':
      return 'bg-amber-50 text-amber-700 dark:bg-amber-900/20 dark:text-amber-400';
    case 'low':
      return 'bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400';
    default:
      return 'bg-gray-50 text-gray-600 dark:bg-gray-900/20 dark:text-gray-400';
  }
};

// 마켓쉐어 포맷팅 함수 추가
const formatMarketShare = (value: string | undefined): string => {
  if (!value) return 'No data';
  if (value === '0') return '0%';
  const numValue = parseFloat(value.replace(/[^0-9.]/g, ''));
  return isNaN(numValue) ? 'No data' : `${numValue}%`;
};

// 성장률 포맷팅 함수 추가
const formatGrowthRate = (value: string | undefined): string => {
  if (!value) return 'No data';
  if (value === '0') return '0%';
  const numValue = parseFloat(value.replace(/[^0-9.]/g, ''));
  return isNaN(numValue) ? 'No data' : `${numValue}%`;
};

// Overall Rating 스타일 함수 추가
const getOverallRatingStyle = (rating: string) => {
  if (rating.toLowerCase().includes('high potential') || rating.toLowerCase().includes('invest')) {
    return {
      cardBg: 'from-emerald-500 to-green-600',
      textColor: 'text-emerald-700'
    };
  }
  if (rating.toLowerCase().includes('moderate') || rating.toLowerCase().includes('consider')) {
    return {
      cardBg: 'from-amber-500 to-yellow-600',
      textColor: 'text-amber-700'
    };
  }
  return {
    cardBg: 'from-red-500 to-pink-600',
    textColor: 'text-red-700'
  };
};

// Growth Rate Badge 컴포넌트 추가
function GrowthRateBadge({ rate }: { rate: string }) {
  const growthRate = parseFloat(rate.replace(/[^0-9.]/g, ''));
  
  const getGrowthStyle = (rate: number) => {
    if (rate >= 50) return 'from-emerald-500 to-teal-600';
    if (rate >= 30) return 'from-blue-500 to-indigo-600';
    if (rate >= 20) return 'from-yellow-500 to-amber-600';
    if (rate >= 10) return 'from-orange-500 to-red-600';
    return 'from-red-500 to-pink-600';
  };

  const getGrowthIcon = (rate: number) => {
    if (rate >= 50) return '🚀';
    if (rate >= 30) return '📈';
    if (rate >= 20) return '💹';
    if (rate >= 10) return '📊';
    return '📉';
  };

  return (
    <div className="relative group">
      <div className={`flex items-center px-4 py-2 rounded-xl bg-gradient-to-r ${getGrowthStyle(growthRate)} shadow-lg`}>
        <div className="flex flex-col items-center">
          <div className="flex items-center space-x-2">
            <span className="text-lg font-bold text-white">{formatGrowthRate(rate)}</span>
            <span className="text-xl">{getGrowthIcon(growthRate)}</span>
          </div>
          <div className="text-xs text-white/90">Growth Rate</div>
        </div>
      </div>
      <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
    </div>
  );
}

// Funding Round Badge 컴포넌트 수정
function FundingRoundBadge({ round }: { round: string }) {
  const displayText = round.toLowerCase().includes('round') ? round : `${round} Round`;
  
  return (
    <div className="relative group">
      <div className="flex items-center px-4 py-2 rounded-xl bg-gradient-to-r from-blue-500 to-indigo-600 shadow-lg">
        <span className="text-white font-bold">{displayText}</span>
      </div>
      <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
    </div>
  );
}

// 섹션 헤더 공통 스타일 컴포넌트 수정
function SectionHeader({ icon: Icon, title, rating }: { 
  icon: any; 
  title: string; 
  rating?: string;
}) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex items-center justify-between mb-8"
    >
      <div className="flex items-center space-x-4">
        <div className="w-12 h-12 rounded-2xl flex items-center justify-center">
          <Icon className="w-6 h-6 text-muted-foreground" />
        </div>
        <Title className="text-2xl font-bold">{title}</Title>
      </div>
      {rating && <StatusBadge status={rating} />}
    </motion.div>
  );
}

// 금액 포맷팅 함수 수정
function formatFinancialValue(value: string | number): string {
  const num = typeof value === 'string' ? parseFloat(value) : value;
  const absNum = Math.abs(num);
  
  if (absNum >= 1000000000) {
    return `${(num / 1000000000).toFixed(1)}B`;
  } else if (absNum >= 1000000) {
    return `${(num / 1000000).toFixed(1)}M`;
  } else if (absNum >= 1000) {
    return `${(num / 1000).toFixed(1)}K`;
  }
  return num.toString();
}

export default function AnalysisPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isDownloading, setIsDownloading] = useState(false);
  const { theme, setTheme } = useTheme();
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const storedAnalysis = localStorage.getItem('analysisResult');
    if (storedAnalysis) {
      try {
        const parsedAnalysis = JSON.parse(storedAnalysis);
        // output 객체 안에서 데이터 추출
        const analysisData = Array.isArray(parsedAnalysis) ? 
          parsedAnalysis[0]?.output : 
          parsedAnalysis?.output;
        
        if (!analysisData) {
          console.error('Analysis data not found in the expected structure');
          setData(null);
        } else {
          console.log('Successfully parsed analysis data:', analysisData);
          setData(analysisData);
        }
      } catch (error) {
        console.error('Error parsing analysis data:', error);
        setData(null);
      }
    }
    setLoading(false);
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-background p-6 lg:p-8">
        <div className="mx-auto max-w-7xl animate-pulse space-y-8">
          <div className="h-8 w-1/3 rounded-lg bg-muted"></div>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-32 rounded-xl bg-muted"></div>
            ))}
      </div>
        </div>
      </div>
    );
  }

  if (!data) return null;

  const handleDownload = async () => {
    try {
      setIsDownloading(true);
      
      if (!contentRef.current) return;

      // 스크롤 위치 저장
      const scrollPos = window.scrollY;

      // PDF 생성을 위한 설정
      const pdf = new jsPDF('p', 'mm', 'a4', true);
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      
      // 컨텐츠의 실제 높이 계산
      const contentHeight = contentRef.current.scrollHeight;
      const contentWidth = contentRef.current.scrollWidth;
      const scale = pdfWidth / contentWidth;
      const totalPages = Math.ceil((contentHeight * scale) / pdfHeight);

      // 각 페이지 생성
      for (let page = 0; page < totalPages; page++) {
        const canvas = await html2canvas(contentRef.current, {
          y: page * (pdfHeight / scale),
          height: pdfHeight / scale,
          scale: 2,
          useCORS: true,
          logging: false,
          backgroundColor: null,  // 배경색 자동 감지
          onclone: (clonedDoc) => {
            // 클론된 문서의 스타일을 현재 문서와 동일하게 유지
            Array.from(document.styleSheets).forEach(styleSheet => {
              try {
                const cssRules = Array.from(styleSheet.cssRules || styleSheet.rules);
                const style = document.createElement('style');
                style.innerHTML = cssRules.map(rule => rule.cssText).join('\n');
                clonedDoc.head.appendChild(style);
              } catch (e) {
                console.warn('Failed to copy stylesheet:', e);
              }
            });
          }
        });

        const imgData = canvas.toDataURL('image/jpeg', 1.0);

        if (page > 0) {
          pdf.addPage();
        }

        pdf.addImage(imgData, 'JPEG', 0, 0, pdfWidth, pdfHeight);
      }

      // PDF 저장
      pdf.save(`${data.meta.company_name}_Analysis.pdf`);
      
      // 스크롤 위치 복구
      window.scrollTo(0, scrollPos);
      
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Failed to generate PDF. Please try again.');
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      {/* 상단 네비게이션 */}
      <nav className="fixed top-0 left-0 right-0 z-50 border-b bg-background/80 backdrop-blur-lg supports-[backdrop-filter]:bg-background/80">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <button
              onClick={() => router.push('/')}
              className="flex items-center space-x-2 text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft className="h-5 w-5" />
              <span>Back</span>
            </button>
            <div className="flex items-center space-x-6">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ 
                  opacity: typeof window !== 'undefined' && window.scrollY > 100 ? 1 : 0,
                  x: typeof window !== 'undefined' && window.scrollY > 100 ? 0 : -20 
                }}
                transition={{ duration: 0.2 }}
                className="text-lg font-semibold bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/80"
              >
                {data.meta.company_name}
              </motion.div>
              <button
                onClick={handleDownload}
                className="inline-flex items-center justify-center rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow transition-colors hover:bg-primary/90"
              >
                <ArrowRight className="mr-2 h-4 w-4" />
                Download Report
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* PDF 생성 중 로딩 표시 */}
      {isDownloading && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-background/80 backdrop-blur-sm">
          <div className="flex flex-col items-center space-y-4">
            <Loader2 className="w-16 h-16 text-primary animate-spin" />
            <Text className="text-muted-foreground">Generating PDF...</Text>
          </div>
        </div>
      )}

      <main ref={contentRef} className="mx-auto max-w-7xl px-4 pt-24 pb-8 sm:px-6 lg:px-8">
        {/* 회사 정보 섹션 */}
        <div className="mb-12 space-y-6">
          <div>
            <h1 className="text-4xl font-bold tracking-tight">{data.meta.company_name}</h1>
            <div className="mt-2 flex items-center space-x-4 text-muted-foreground">
              <a href={data.meta.website} target="_blank" rel="noopener noreferrer" className="hover:text-foreground">
                <Globe className="inline-block h-4 w-4 mr-1" />
                {data.meta.website}
              </a>
              <span>|</span>
              <span>{data.meta.industry}</span>
            </div>
            <p className="mt-4 text-lg text-muted-foreground">{data.executive_summary.description}</p>
          </div>
          
          <div className="flex flex-wrap gap-4">
            <RiskPotentialBadge
              rating_risk={data.recommendation.rating_risk}
              rating_potential={data.recommendation.rating_potential}
            />
          </div>
        </div>

        {/* 주요 지표 및 분석 내용 */}
        <div className="space-y-12">
          {/* Executive Summary */}
          <section>
            <SectionHeader
              icon={Zap}
              title="Executive Summary"
            />
            <div className="mb-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              <MetricTile
                title="Current Valuation"
                value={data.executive_summary.funding_request.valuation.pre_money ? 
                  formatCurrencyValue(data.executive_summary.funding_request.valuation.pre_money) : 
                  'N/A'}
                icon={DollarSign}
              />
              <MetricTile
                title="Funding Request"
                value={data.executive_summary.funding_request.amount ? 
                  formatCurrencyValue(data.executive_summary.funding_request.amount) : 
                  'N/A'}
                description={`Round: ${data.executive_summary.funding_request.round || 'N/A'}`}
                icon={Target}
              />
              <MetricTile
                title="Growth Rate"
                value={data.executive_summary.key_metrics.growth_rate ? 
                  `${data.executive_summary.key_metrics.growth_rate}%` : 
                  'N/A'}
                icon={TrendingUp}
              />
            </div>
            <div className="grid gap-6 md:grid-cols-2">
              <InsightCard
                title="Key Strengths"
                insights={data.recommendation?.key_positives || []}
              />
              <InsightCard
                title="Areas of Improvement"
                insights={data.recommendation?.key_concerns || []}
              />
            </div>
          </section>

          {/* Market Analysis */}
          <section>
            <SectionHeader
              icon={Globe}
              title="Market Analysis"
              rating={data.analysis.market.rating}
            />
            <div className="grid gap-6 md:grid-cols-2">
              <Card>
                <Title>Market Definition</Title>
                <Text>{data.analysis.market.market_definition}</Text>
              </Card>
              <Card>
                <Title>Market Size</Title>
                <div className="mt-4 space-y-2">
                  <div className="flex justify-between">
                    <Text>TAM</Text>
                    <Text>{formatCurrencyValue(data.analysis.market.market_size.tam)}</Text>
                  </div>
                  <div className="flex justify-between">
                    <Text>SAM</Text>
                    <Text>{formatCurrencyValue(data.analysis.market.market_size.sam)}</Text>
                  </div>
                  <div className="flex justify-between">
                    <Text>SOM</Text>
                    <Text>{data.analysis.market.market_size.som ? formatCurrencyValue(data.analysis.market.market_size.som) : 'N/A'}</Text>
                  </div>
                </div>
              </Card>
            </div>
            <div className="mt-6 grid gap-6 md:grid-cols-2">
              <InsightCard title="Key Drivers" insights={data.analysis.market.key_drivers} />
              <InsightCard title="Market Concerns" insights={data.analysis.market.concerns} />
            </div>
          </section>

          {/* Product Analysis */}
          <section>
            <SectionHeader
              icon={Layers}
              title="Product Analysis"
              rating={data.analysis.product.rating}
            />
            <div className="grid gap-6 md:grid-cols-2">
              <Card>
                <Title>Core Features</Title>
                <div className="mt-4 space-y-2">
                  {data.analysis.product.core_features.map((feature: string, index: number) => (
                    <div key={index} className="flex items-start space-x-2">
                      <CheckCircle2 className="h-5 w-5 text-primary mt-0.5" />
                      <Text>{feature}</Text>
                    </div>
                  ))}
                </div>
              </Card>
              <Card>
                <Title>Development Roadmap</Title>
                <div className="mt-4 space-y-4">
                  {data.analysis.product.development_roadmap.map((milestone: any, index: number) => (
                    <div key={index} className="flex items-start space-x-3">
                      <Calendar className="h-5 w-5 text-primary mt-0.5" />
                      <div>
                        <Text className="font-medium">{milestone.milestone}</Text>
                        <Text className="text-sm text-muted-foreground">{milestone.target_date}</Text>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            </div>
            <div className="mt-6 grid gap-6 md:grid-cols-2">
              <InsightCard title="Product Strengths" insights={data.analysis.product.strengths} />
              <InsightCard title="Product Concerns" insights={data.analysis.product.concerns} />
            </div>
          </section>

          {/* Business Model Analysis */}
          <section>
            <SectionHeader
              icon={BarChartIcon}
              title="Business Model Analysis"
              rating={data.analysis.business_model.rating}
            />
            <div className="grid gap-6 md:grid-cols-2">
              <Card>
                <Title>Business Model Overview</Title>
                <Text className="mt-4">{data.analysis.business_model.business_model_desciption}</Text>
              </Card>
              <Card>
                <Title>Revenue Streams</Title>
                <div className="mt-4 space-y-4">
                  {data.analysis.business_model.revenue_streams.map((stream: any, index: number) => (
                    <div key={index} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Text className="font-medium">{stream.type}</Text>
                        <Badge>{stream.share}%</Badge>
                      </div>
                      <Text className="text-sm text-muted-foreground">{stream.description}</Text>
                    </div>
                  ))}
                </div>
              </Card>
            </div>
            <div className="mt-6">
              <Card>
                <Title>Unit Economics</Title>
                <div className="mt-4 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                  <div>
                    <Text className="text-sm text-muted-foreground">CAC</Text>
                    <div className="mt-2 space-y-1">
                      <div className="flex justify-between">
                        <Text className="text-sm">Current</Text>
                        <Text className="font-medium">${data.analysis.business_model.unit_economics.cac.current}</Text>
                      </div>
                      <div className="flex justify-between">
                        <Text className="text-sm">Target</Text>
                        <Text className="font-medium">${data.analysis.business_model.unit_economics.cac.target}</Text>
                      </div>
                    </div>
                  </div>
                  <div>
                    <Text className="text-sm text-muted-foreground">LTV</Text>
                    <div className="mt-2 space-y-1">
                      <div className="flex justify-between">
                        <Text className="text-sm">Current</Text>
                        <Text className="font-medium">${data.analysis.business_model.unit_economics.ltv.current}</Text>
                      </div>
                      <div className="flex justify-between">
                        <Text className="text-sm">Target</Text>
                        <Text className="font-medium">${data.analysis.business_model.unit_economics.ltv.target}</Text>
                      </div>
                    </div>
                  </div>
                  <div>
                    <Text className="text-sm text-muted-foreground">Conversion Rate</Text>
                    <div className="mt-2 space-y-1">
                      <div className="flex justify-between">
                        <Text className="text-sm">Current</Text>
                        <Text className="font-medium">{data.analysis.business_model.unit_economics.conversion_rate.current}%</Text>
                      </div>
                      <div className="flex justify-between">
                        <Text className="text-sm">Target</Text>
                        <Text className="font-medium">{data.analysis.business_model.unit_economics.conversion_rate.target}%</Text>
                      </div>
                    </div>
                  </div>
                  <div>
                    <Text className="text-sm text-muted-foreground">Gross Margin</Text>
                    <div className="mt-2 space-y-1">
                      <div className="flex justify-between">
                        <Text className="text-sm">Current</Text>
                        <Text className="font-medium">{data.analysis.business_model.unit_economics.gross_margin.current || 'N/A'}</Text>
                      </div>
                      <div className="flex justify-between">
                        <Text className="text-sm">Target</Text>
                        <Text className="font-medium">{data.analysis.business_model.unit_economics.gross_margin.target || 'N/A'}</Text>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            </div>
            <div className="mt-6 grid gap-6 md:grid-cols-2">
              <InsightCard title="Business Model Strengths" insights={data.analysis.business_model.strengths} />
              <InsightCard title="Business Model Concerns" insights={data.analysis.business_model.concerns} />
            </div>
          </section>

          {/* Team Analysis */}
          <section>
            <SectionHeader
              icon={Users2}
              title="Team Analysis"
              rating={data.analysis.team.rating}
            />
            <div className="grid gap-6 md:grid-cols-2">
              <Card>
                <Title>Key Members</Title>
                <div className="mt-4 space-y-4">
                  {data.analysis.team.key_members.map((member: TeamMember, index: number) => (
                    <div key={index} className="flex items-start space-x-3">
                      <Users className="h-5 w-5 text-primary mt-0.5" />
                      <div>
                        <Text className="font-medium">{member.role}</Text>
                        <Text className="text-sm">{member.name}</Text>
                        <Text className="text-sm text-muted-foreground">{member.background}</Text>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
              <Card>
                <Title>Hiring Plans</Title>
                <div className="mt-4 space-y-4">
                  {data.analysis.team.hiring_plans.map((plan: HiringPlan, index: number) => (
                    <div key={index} className="flex items-start space-x-3">
                      <AlertCircle className="h-5 w-5 text-primary mt-0.5" />
                      <div>
                        <Text className="font-medium">{plan.role}</Text>
                        <Badge className={
                          plan.priority === 'high' ? 'bg-red-500' :
                          plan.priority === 'medium' ? 'bg-amber-500' :
                          'bg-blue-500'
                        }>
                          {plan.priority.toUpperCase()}
                        </Badge>
                        <Text className="text-sm text-muted-foreground">{plan.timeline}</Text>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            </div>
            <div className="mt-6 grid gap-6 md:grid-cols-2">
              <InsightCard title="Team Strengths" insights={data.analysis.team.strengths} />
              <InsightCard title="Team Concerns" insights={data.analysis.team.concerns} />
            </div>
          </section>

          {/* Financial Analysis */}
          <section>
            <SectionHeader
              icon={DollarSign}
              title="Financial Analysis"
              rating={data.analysis.financials.rating}
            />
            <div className="grid gap-6 md:grid-cols-2">
              <Card>
                <Title>Current Financials</Title>
                <div className="mt-4 space-y-2">
                  <div className="flex justify-between">
                    <Text>Revenue</Text>
                    <Text>{formatCurrencyValue(data.analysis.financials.current.revenue || 0)}</Text>
                  </div>
                  <div className="flex justify-between">
                    <Text>Costs</Text>
                    <Text>{data.analysis.financials.current.costs ? formatCurrencyValue(data.analysis.financials.current.costs) : 'N/A'}</Text>
                  </div>
                  <div className="flex justify-between">
                    <Text>Burn Rate</Text>
                    <Text>{data.analysis.financials.current.burn_rate ? formatCurrencyValue(data.analysis.financials.current.burn_rate) : 'N/A'}</Text>
                  </div>
                  <div className="flex justify-between">
                    <Text>Cash</Text>
                    <Text>{data.analysis.financials.current.cash ? formatCurrencyValue(data.analysis.financials.current.cash) : 'N/A'}</Text>
                  </div>
                </div>
              </Card>
              <Card>
                <Title>Key Assumptions</Title>
                <div className="mt-4 space-y-2">
                  {data.analysis.financials.projections.key_assumptions.map((assumption: string, index: number) => (
                    <div key={index} className="flex items-start space-x-2">
                      <CheckCircle2 className="h-5 w-5 text-primary mt-0.5" />
                      <Text>{assumption}</Text>
                    </div>
                  ))}
                </div>
              </Card>
            </div>
            <div className="mt-6">
              <Card>
                <Title>Financial Projections</Title>
                <div className="mt-4">
                  <LineChart
                    data={data.analysis.financials.projections.years.map((year: string, index: number) => {
                      const accumulatedCashflow = data.analysis.financials.projections.net_income
                        .slice(0, index + 1)
                        .reduce((acc: number, curr: string) => acc + parseInt(curr), 0);
                      
                      return {
                        year,
                        Revenue: parseInt(data.analysis.financials.projections.revenue[index]),
                        Costs: parseInt(data.analysis.financials.projections.costs[index]),
                        "Accumulated Cashflow": accumulatedCashflow
                      };
                    })}
                    index="year"
                    categories={["Revenue", "Costs", "Accumulated Cashflow"]}
                    colors={["emerald", "red", "blue"]}
                    valueFormatter={(value: number) => formatFinancialValue(value)}
                    yAxisWidth={60}
                    showLegend={true}
                    className="h-80"
                    curveType="natural"
                    enableLegendSlider={true}
                    connectNulls={true}
                  />
                </div>
                <div className="mt-4 overflow-x-auto">
                  <table className="min-w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="py-2 text-left">Year</th>
                        <th className="py-2 text-right">Revenue</th>
                        <th className="py-2 text-right">Costs</th>
                        <th className="py-2 text-right">Accumulated Cashflow</th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.analysis.financials.projections.years.map((year: string, index: number) => {
                        const accumulatedCashflow = data.analysis.financials.projections.net_income
                          .slice(0, index + 1)
                          .reduce((acc: number, curr: string) => acc + parseInt(curr), 0);
                        
                        return (
                          <tr key={year} className="border-b last:border-0">
                            <td className="py-2">{year}</td>
                            <td className="py-2 text-right">{formatFinancialValue(data.analysis.financials.projections.revenue[index])}</td>
                            <td className="py-2 text-right">{formatFinancialValue(data.analysis.financials.projections.costs[index])}</td>
                            <td className="py-2 text-right">{formatFinancialValue(accumulatedCashflow)}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </Card>
            </div>
            <div className="mt-6 grid gap-6 md:grid-cols-2">
              <InsightCard title="Financial Strengths" insights={data.analysis.financials.strengths} />
              <InsightCard title="Financial Concerns" insights={data.analysis.financials.concerns} />
            </div>
          </section>

          {/* Competition Analysis */}
          <section>
            <SectionHeader
              icon={Users}
              title="Competition Analysis"
              rating={data.analysis.competition.rating}
            />
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {data.analysis.competition.competitors.map((competitor: Competitor, index: number) => (
                <Card key={index}>
                  <div className="flex items-center justify-between">
                    <Title>{competitor.name}</Title>
                    <Badge>{competitor.type}</Badge>
                  </div>
                  <div className="mt-4 space-y-2">
                    {Array.isArray(competitor.key_strength) ? 
                      competitor.key_strength.map((strength: string, idx: number) => (
                        <div key={idx} className="flex items-start space-x-2">
                          <CheckCircle2 className="h-4 w-4 text-primary mt-0.5" />
                          <Text className="text-sm">{strength}</Text>
                        </div>
                      )) : 
                      <div className="flex items-start space-x-2">
                        <CheckCircle2 className="h-4 w-4 text-primary mt-0.5" />
                        <Text className="text-sm">{competitor.key_strength}</Text>
                      </div>
                    }
                    {competitor.market_share && (
                      <div className="mt-4">
                        <Text className="text-sm font-medium">Market Share</Text>
                        <Text className="text-lg font-bold">{competitor.market_share}%</Text>
                      </div>
                    )}
                  </div>
                </Card>
              ))}
            </div>
            <div className="mt-6 grid gap-6 md:grid-cols-2">
              <InsightCard title="Competitive Advantages" insights={data.analysis.competition.competitive_advantages} />
              <InsightCard title="Competition Concerns" insights={data.analysis.competition.concerns} />
            </div>
          </section>

          {/* Risk Analysis */}
          <section>
            <SectionHeader
              icon={AlertTriangle}
              title="Risk Analysis"
              rating={data.analysis.risks.rating}
            />
            <div className="grid gap-6">
              {data.analysis.risks.risk_factors.map((risk: RiskFactor, index: number) => (
                <Card key={index}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <Badge className={
                        risk.severity === 'high' ? 'bg-red-500' :
                        risk.severity === 'medium' ? 'bg-amber-500' :
                        'bg-blue-500'
                      }>
                        {risk.severity.toUpperCase()}
                      </Badge>
                      <Title>{risk.category}</Title>
                    </div>
                  </div>
                  <div className="mt-4 space-y-2">
                    <Text>{risk.description}</Text>
                    <div className="flex items-start space-x-2">
                      <Shield className="h-5 w-5 text-primary mt-0.5" />
                      <Text className="text-sm text-muted-foreground">{risk.mitigation_plan}</Text>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </section>

          {/* Investment Recommendation */}
          <section>
            <SectionHeader
              icon={ZapIcon}
              title="Investment Recommendation"
              rating={data.recommendation.rating}
            />
            <div className="grid gap-6">
              <Card>
                <Title>Rationale</Title>
                <Text className="mt-2">{data.recommendation.rationale}</Text>
              </Card>
              <div className="grid gap-6 md:grid-cols-2">
                <Card>
                  <Title>Due Diligence Requirements</Title>
                  <div className="mt-4 space-y-4">
                    {data.recommendation.due_diligence.map((item: DueDiligence, index: number) => (
                      <div key={index}>
                        <div className="flex items-center space-x-2">
                          <div className={`w-3 h-3 rounded-full bg-gradient-to-r ${
                            item.priority === 'high' ? 'from-red-400 to-red-600' :
                            item.priority === 'medium' ? 'from-amber-400 to-amber-600' :
                            'from-blue-400 to-blue-600'
                          }`} />
                          <Text className="font-medium">{item.area}</Text>
                        </div>
                        <div className="mt-2 ml-5 space-y-1">
                          {item.requirements.map((req: string, idx: number) => (
                            <Text key={idx} className="text-sm text-muted-foreground">• {req}</Text>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </Card>
                <Card>
                  <Title>Investment Conditions</Title>
                  <div className="mt-4 space-y-4">
                    {data.recommendation.conditions.map((condition: Condition, index: number) => (
                      <div key={index} className="flex items-center space-x-2">
                        <div className={`w-3 h-3 rounded-full bg-gradient-to-r ${
                          condition.priority === 'high' ? 'from-red-400 to-red-600' :
                          condition.priority === 'medium' ? 'from-amber-400 to-amber-600' :
                          'from-blue-400 to-blue-600'
                        }`} />
                        <Text>{condition.requirement}</Text>
                      </div>
                    ))}
                  </div>
                </Card>
              </div>
            </div>
          </section>
        </div>
      </main>

      {/* 면책 조항 및 브랜딩 */}
      <footer className="border-t bg-muted/50">
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          <div className="flex flex-col items-center justify-between space-y-6 text-center">
            <p className="text-sm text-muted-foreground max-w-2xl">
              This report was generated by AI and should be used for reference purposes only. 
              The analysis provided does not constitute financial advice.
            </p>
            <a
              href="https://weeklyventures.xyz"
              target="_blank"
              rel="noopener noreferrer"
              className="flex flex-col items-center space-y-2 group"
            >
              <img 
                src="/weekly_logo.png" 
                alt="WeeklyVentures Logo" 
                className="h-16 w-auto opacity-80 group-hover:opacity-100 transition-opacity"
              />
              <span className="text-sm text-muted-foreground group-hover:text-foreground transition-colors">
                Powered by WeeklyVentures
              </span>
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}