import React, { useState, useMemo, useCallback } from "react";
import { Button } from "../../shared/components/ui/button";
import { Badge } from "../../shared/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "../../shared/components/ui/tooltip";
import { ChevronDown, ChevronUp, Sparkles } from "lucide-react";
import { ChatQuestion } from "../types";

// Fallback questions defined outside component to prevent recreation
const FALLBACK_QUESTIONS: ChatQuestion[] = [
  {
    id: "1",
    question: "What is cash flow analysis?",
    topicDescription: "Cash flow analysis fundamentals",
    contextHints: ["operating cash flow", "free cash flow", "cash flow statement"],
    priority: 1,
  },
  {
    id: "2",
    question: "How do I evaluate credit risk?",
    topicDescription: "Credit risk assessment",
    contextHints: ["credit analysis", "risk factors", "loan underwriting"],
    priority: 1,
  },
  {
    id: "3",
    question: "Explain debt capacity ratios",
    topicDescription: "Financial ratio analysis",
    contextHints: ["debt service coverage", "leverage ratios", "financial health"],
    priority: 1,
  },
  {
    id: "4",
    question: "What are the five C's of credit?",
    topicDescription: "Credit analysis framework",
    contextHints: ["character", "capacity", "capital", "collateral", "conditions"],
    priority: 1,
  },
  {
    id: "5",
    question: "How do I calculate debt service coverage ratio?",
    topicDescription: "DSCR calculation",
    contextHints: ["debt service", "cash flow", "EBITDA", "loan payments"],
    priority: 1,
  },
  {
    id: "6",
    question: "What factors affect loan pricing?",
    topicDescription: "Loan pricing components",
    contextHints: ["interest rates", "risk premium", "market conditions"],
    priority: 1,
  },
  {
    id: "7",
    question: "How to analyze working capital needs?",
    topicDescription: "Working capital analysis",
    contextHints: ["current assets", "current liabilities", "liquidity"],
    priority: 1,
  },
  {
    id: "8",
    question: "What is collateral valuation?",
    topicDescription: "Collateral assessment",
    contextHints: ["asset valuation", "loan-to-value", "security interest"],
    priority: 1,
  },
  {
    id: "9",
    question: "How to structure a commercial loan?",
    topicDescription: "Loan structuring",
    contextHints: ["loan terms", "repayment schedule", "covenants"],
    priority: 2,
  },
  {
    id: "10",
    question: "What are bank regulatory requirements?",
    topicDescription: "Banking regulations",
    contextHints: ["compliance", "capital requirements", "regulatory oversight"],
    priority: 2,
  },
  {
    id: "11",
    question: "How to assess industry risk?",
    topicDescription: "Industry analysis",
    contextHints: ["market trends", "competitive landscape", "sector risks"],
    priority: 2,
  },
  {
    id: "12",
    question: "What is loan documentation process?",
    topicDescription: "Loan documentation",
    contextHints: ["legal documents", "loan agreements", "compliance"],
    priority: 2,
  },
  {
    id: "13",
    question: "How to monitor loan performance?",
    topicDescription: "Loan monitoring",
    contextHints: ["performance metrics", "early warning signs", "portfolio management"],
    priority: 2,
  },
  {
    id: "14",
    question: "What are environmental risk factors?",
    topicDescription: "Environmental due diligence",
    contextHints: ["environmental liability", "ESG factors", "regulatory compliance"],
    priority: 3,
  },
  {
    id: "15",
    question: "How to handle loan workout situations?",
    topicDescription: "Loan workouts",
    contextHints: ["troubled debt", "restructuring", "loss mitigation"],
    priority: 3,
  },
  {
    id: "16",
    question: "What are cross-default provisions?",
    topicDescription: "Loan covenants",
    contextHints: ["default triggers", "loan agreements", "risk management"],
    priority: 3,
  },
  {
    id: "17",
    question: "How to assess management quality?",
    topicDescription: "Management evaluation",
    contextHints: ["leadership assessment", "track record", "business experience"],
    priority: 3,
  },
  {
    id: "18",
    question: "What is stress testing in lending?",
    topicDescription: "Stress testing",
    contextHints: ["scenario analysis", "risk assessment", "capital adequacy"],
    priority: 3,
  },
  {
    id: "19",
    question: "How to price construction loans?",
    topicDescription: "Construction lending",
    contextHints: ["project financing", "draw schedules", "completion risk"],
    priority: 4,
  },
  {
    id: "20",
    question: "What are SBA loan requirements?",
    topicDescription: "SBA lending",
    contextHints: ["government programs", "guarantee structure", "eligibility"],
    priority: 4,
  },
  {
    id: "21",
    question: "How to evaluate real estate investments?",
    topicDescription: "Real estate lending",
    contextHints: ["property valuation", "NOI analysis", "cap rates"],
    priority: 4,
  },
  {
    id: "22",
    question: "What is asset-based lending?",
    topicDescription: "Asset-based financing",
    contextHints: ["inventory financing", "receivables", "asset coverage"],
    priority: 4,
  },
  {
    id: "23",
    question: "How to assess borrower's cash management?",
    topicDescription: "Cash management analysis",
    contextHints: ["treasury operations", "cash conversion cycle", "liquidity planning"],
    priority: 5,
  },
  {
    id: "24",
    question: "What are covenant compliance requirements?",
    topicDescription: "Loan covenant monitoring",
    contextHints: ["financial covenants", "reporting requirements", "compliance testing"],
    priority: 5,
  },
  {
    id: "25",
    question: "How to handle international trade financing?",
    topicDescription: "Trade finance",
    contextHints: ["letters of credit", "export financing", "documentary collections"],
    priority: 5,
  },
];

interface DynamicQuestionsProps {
  onQuestionClick: (
    question: string,
    questionData?: {
      topicDescription?: string;
      contextHints?: string[];
    }
  ) => void;
  isLoading: boolean;
  questions?: ChatQuestion[];
  maxInitialQuestions?: number;
  fallbackQuestions?: ChatQuestion[]; // New prop for configurable fallback questions
}

export { FALLBACK_QUESTIONS };

export const DynamicQuestions: React.FC<DynamicQuestionsProps> = ({
  onQuestionClick,
  isLoading,
  questions = [],
  maxInitialQuestions = 8, // Changed from 5 to 8 to match original (4x2 grid)
  fallbackQuestions = FALLBACK_QUESTIONS, // Use provided fallback or default
}) => {
  const [showMore, setShowMore] = useState(false);

  const { initialQuestions, additionalQuestions, questionsLoaded } = useMemo(() => {
    const questionsToUse = questions.length > 0 ? questions : fallbackQuestions;
    const sortedQuestions = [...questionsToUse].sort((a, b) => a.priority - b.priority);
    const initial = sortedQuestions.slice(0, maxInitialQuestions);
    const additional = sortedQuestions.slice(maxInitialQuestions);
    
    return {
      initialQuestions: initial,
      additionalQuestions: additional,
      questionsLoaded: initial.length > 0,
    };
  }, [questions, maxInitialQuestions, fallbackQuestions]);

  const handleToggleMore = useCallback(() => {
    setShowMore(prev => !prev);
  }, []);

  const truncateText = useCallback((text: string, maxLength: number = 120) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength).trim() + "...";
  }, []);

  const renderQuestion = (question: ChatQuestion, index: number) => {
    const truncatedQuestion = truncateText(question.question);
    const isLongQuestion = question.question.length > 120;

    const questionButton = (
      <Button
        key={`${question.id}-${index}`}
        variant="outline"
        size="sm"
        onClick={() =>
          onQuestionClick(question.question, {
            topicDescription: question.topicDescription,
            contextHints: question.contextHints,
          })
        }
        disabled={isLoading}
        className="text-left justify-start group hover:bg-blue-50 hover:border-blue-200 hover:text-black transition-colors h-auto min-h-[2.5rem] whitespace-normal p-4"
      >
        <div className="flex flex-col items-start gap-1 w-full">
          <span className="text-sm font-normal leading-tight whitespace-normal break-words">
            {truncatedQuestion}
          </span>
          {question.topicDescription && (
            <Badge 
              variant="secondary" 
              className="text-xs opacity-70 group-hover:opacity-100"
            >
              {question.topicDescription}
            </Badge>
          )}
        </div>
      </Button>
    );

    if (isLongQuestion) {
      return (
        <TooltipProvider key={question.id}>
          <Tooltip>
            <TooltipTrigger asChild>
              {questionButton}
            </TooltipTrigger>
            <TooltipContent 
              side="top" 
              className="max-w-md text-sm p-3"
            >
              <p className="whitespace-normal break-words">
                {question.question}
              </p>
              {question.contextHints && question.contextHints.length > 0 && (
                <div className="mt-2 pt-2 border-t">
                  <p className="text-xs font-medium mb-1">Related topics:</p>
                  <div className="flex flex-wrap gap-1">
                    {question.contextHints.map((hint, i) => (
                      <Badge key={i} variant="outline" className="text-xs">
                        {hint}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      );
    }

    return questionButton;
  };

  if (!questionsLoaded || (initialQuestions.length === 0 && additionalQuestions.length === 0)) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-w-4xl animate-pulse">
        {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
          <div key={i} className="h-12 bg-gray-200 rounded-md border" />
        ))}
      </div>
    );
  }

  return (
    <TooltipProvider>
      <div className="max-w-4xl">
        {/* Initial Questions - Grid Layout */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {initialQuestions.map((question, index) =>
            renderQuestion(question, index)
          )}
        </div>

        {/* Show More Button */}
        {additionalQuestions.length > 0 && (
          <div className="mt-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleToggleMore}
              disabled={isLoading}
              className="w-full text-blue-600 hover:text-blue-700 hover:bg-blue-50"
            >
              <Sparkles className="w-3 h-3 mr-2" />
              {showMore ? (
                <>
                  Show fewer questions
                  <ChevronUp className="w-3 h-3 ml-2" />
                </>
              ) : (
                <>
                  Show more questions ({additionalQuestions.length})
                  <ChevronDown className="w-3 h-3 ml-2" />
                </>
              )}
            </Button>
          </div>
        )}

        {/* Additional Questions - Grid Layout */}
        {showMore && additionalQuestions.length > 0 && (
          <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-3 animate-in slide-in-from-top-2 duration-200">
            {additionalQuestions.map((question, index) =>
              renderQuestion(question, index + initialQuestions.length)
            )}
          </div>
        )}

        {/* Metadata Footer */}
        {questionsLoaded && (
          <div className="mt-4 text-center">
            <p className="text-xs text-gray-400">
              <Sparkles className="w-3 h-3 inline mr-1" />
              Questions generated from your documents
            </p>
          </div>
        )}
      </div>
    </TooltipProvider>
  );
};