import React, { useState, useEffect } from "react";
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
}

export const DynamicQuestions: React.FC<DynamicQuestionsProps> = ({
  onQuestionClick,
  isLoading,
  questions = [],
  maxInitialQuestions = 8, // Changed from 5 to 8 to match original (4x2 grid)
}) => {
  const [initialQuestions, setInitialQuestions] = useState<ChatQuestion[]>([]);
  const [additionalQuestions, setAdditionalQuestions] = useState<ChatQuestion[]>([]);
  const [showMore, setShowMore] = useState(false);
  const [questionsLoaded, setQuestionsLoaded] = useState(false);

  useEffect(() => {
    // Default fallback questions with more variety to show the grid
    const fallbackQuestions: ChatQuestion[] = [
      {
        id: "1",
        question: "What are the key factors in commercial lending?",
        topicDescription: "Commercial lending",
        contextHints: ["risk assessment", "credit analysis", "loan terms"],
        priority: 1,
      },
      {
        id: "2", 
        question: "How do you analyze a company's financial statements?",
        topicDescription: "Financial analysis",
        contextHints: ["balance sheet", "income statement", "cash flow"],
        priority: 1,
      },
      {
        id: "3",
        question: "What are the different types of business loans?",
        topicDescription: "Loan types",
        contextHints: ["term loans", "lines of credit", "equipment financing"],
        priority: 1,
      },
      {
        id: "4",
        question: "How do you calculate debt service coverage ratio?",
        topicDescription: "Financial ratios",
        contextHints: ["DSCR", "cash flow", "debt payments"],
        priority: 1,
      },
      {
        id: "5",
        question: "What collateral is typically required for commercial loans?",
        topicDescription: "Collateral",
        contextHints: ["real estate", "equipment", "accounts receivable"],
        priority: 1,
      },
      {
        id: "6",
        question: "How do you assess industry risk in lending?",
        topicDescription: "Risk assessment",
        contextHints: ["market conditions", "industry trends", "competition"],
        priority: 1,
      },
      {
        id: "7",
        question: "What are the requirements for SBA loans?",
        topicDescription: "SBA lending",
        contextHints: ["eligibility", "documentation", "guarantee"],
        priority: 1,
      },
      {
        id: "8",
        question: "How do you structure loan covenants?",
        topicDescription: "Loan structure",
        contextHints: ["financial covenants", "operational covenants", "compliance"],
        priority: 1,
      },
      // Additional questions for "show more"
      {
        id: "9",
        question: "What is the loan-to-value ratio and how is it calculated?",
        topicDescription: "LTV calculations",
        contextHints: ["property value", "loan amount", "appraisal"],
        priority: 2,
      },
      {
        id: "10",
        question: "How do you evaluate management quality in credit decisions?",
        topicDescription: "Management assessment",
        contextHints: ["experience", "track record", "governance"],
        priority: 2,
      },
      {
        id: "11",
        question: "What are the typical interest rate structures for commercial loans?",
        topicDescription: "Interest rates",
        contextHints: ["fixed", "variable", "prime rate"],
        priority: 2,
      },
      {
        id: "12",
        question: "How do you document loan files for compliance?",
        topicDescription: "Documentation",
        contextHints: ["regulatory requirements", "audit trail", "compliance"],
        priority: 2,
      },
      {
        id: "13",
        question: "What are the key performance indicators for commercial lending?",
        topicDescription: "KPIs",
        contextHints: ["portfolio performance", "default rates", "profitability"],
        priority: 2,
      },
      {
        id: "14",
        question: "How do you handle workout and restructuring situations?",
        topicDescription: "Workouts",
        contextHints: ["troubled debt", "restructuring", "recovery"],
        priority: 2,
      },
      {
        id: "15",
        question: "What environmental risk factors should be considered?",
        topicDescription: "Environmental risk",
        contextHints: ["environmental assessment", "liability", "compliance"],
        priority: 2,
      },
      {
        id: "16",
        question: "How do you price commercial loans competitively?",
        topicDescription: "Loan pricing",
        contextHints: ["market rates", "risk premium", "profitability"],
        priority: 2,
      },
      {
        id: "17",
        question: "What are the regulatory requirements for commercial lending?",
        topicDescription: "Regulations",
        contextHints: ["banking regulations", "compliance", "reporting"],
        priority: 2,
      },
      {
        id: "18",
        question: "How do you conduct effective loan committee presentations?",
        topicDescription: "Loan committee",
        contextHints: ["presentation skills", "risk analysis", "decision making"],
        priority: 3,
      },
      {
        id: "19",
        question: "What are the best practices for loan portfolio management?",
        topicDescription: "Portfolio management",
        contextHints: ["diversification", "risk monitoring", "performance tracking"],
        priority: 3,
      },
      {
        id: "20",
        question: "How do you handle cross-selling opportunities in commercial lending?",
        topicDescription: "Cross-selling",
        contextHints: ["relationship banking", "additional products", "revenue generation"],
        priority: 3,
      },
    ];

    const questionsToUse = questions.length > 0 ? questions : fallbackQuestions;
    const sortedQuestions = [...questionsToUse].sort((a, b) => a.priority - b.priority);
    
    setInitialQuestions(sortedQuestions.slice(0, maxInitialQuestions));
    setAdditionalQuestions(sortedQuestions.slice(maxInitialQuestions));
    setQuestionsLoaded(true);
  }, [questions, maxInitialQuestions]);

  const handleToggleMore = () => {
    setShowMore(!showMore);
  };

  const truncateText = (text: string, maxLength: number = 120) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength).trim() + "...";
  };

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