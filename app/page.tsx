"use client"
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Code2, CheckCircle, AlertCircle, RefreshCw, FileCode, Shield, Lightbulb, History, Github, Coffee } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

// Define types for our review response
interface CodeReview {
  score: number;
  suggestions: string[];
  security: string[];
  bestPractices: string;
  complexity: {
    score: number;
    details: string;
  };
  performance: {
    score: number;
    suggestions: string[];
  };
}

interface ReviewHistory {
  timestamp: number;
  code: string;
  review: CodeReview;
}

const CodeReviewer = () => {
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [review, setReview] = useState<CodeReview | null>(null);
  const [error, setError] = useState('');
  const [history, setHistory] = useState<ReviewHistory[]>([]);
  const [selectedLanguage, setSelectedLanguage] = useState('javascript');

  const languages = {
    javascript: 'JavaScript/TypeScript',
    python: 'Python',
    java: 'Java',
    cpp: 'C++',
    ruby: 'Ruby',
    go: 'Go',
  };

  const analyzeCode = async () => {
    if (!code.trim()) {
      setError('Please enter some code to review');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/review', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ code, language: selectedLanguage }),
      });

      if (!response.ok) throw new Error('Review failed');
      
      const data: CodeReview = await response.json();
      setReview(data);
      
      // Add to history
      setHistory(prev => [{
        timestamp: Date.now(),
        code,
        review: data
      }, ...prev].slice(0, 5)); // Keep last 5 reviews
    } catch (err) {
      setError('Failed to analyze code. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getSeverityColor = (score: number) => {
    if (score >= 8) return 'text-green-400';
    if (score >= 6) return 'text-yellow-400';
    return 'text-red-400';
  };

  const renderMetricCard = (title: string, score: number, icon: React.ReactNode) => (
    <Card className="bg-gray-800 border-gray-700">
      <CardContent className="pt-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            {icon}
            <span className="font-medium text-gray-200">{title}</span>
          </div>
          <span className={`text-2xl font-bold ${getSeverityColor(score)}`}>
            {score}/10
          </span>
        </div>
        <Progress 
          value={score * 10} 
          className="mt-4"
          style={{
            backgroundColor: score >= 8 ? '#4CAF50' : score >= 6 ? '#FFC107' : '#F44336'
          }}
          />
      </CardContent>
    </Card>
  );

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 p-24 relative">
      <div className="max-w-6xl mx-auto space-y-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Code2 className="h-6 w-6" />
                    AI Code Quality Reviewer
                  </CardTitle>
                  <CardDescription className="text-gray-400">
                    Get AI-powered analysis and suggestions for your code
                  </CardDescription>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-400">Language:</span>
                  <select
                    value={selectedLanguage}
                    onChange={(e) => setSelectedLanguage(e.target.value)}
                    className="bg-gray-700 border-gray-600 text-white rounded-md px-2 py-1"
                  >
                    {Object.entries(languages).map(([value, label]) => (
                      <option key={value} value={value}>{label}</option>
                    ))}
                  </select>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <Textarea
                placeholder="Paste your code here..."
                className="min-h-[200px] bg-gray-900 border-gray-700 text-white font-mono"
                value={code}
                onChange={(e) => setCode(e.target.value)}
              />
              <Button
                onClick={analyzeCode}
                disabled={loading}
                className="w-full bg-blue-600 hover:bg-blue-700"
              >
                {loading ? (
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <CheckCircle className="h-4 w-4 mr-2" />
                )}
                {loading ? 'Analyzing...' : 'Analyze Code'}
              </Button>
            </CardContent>
          </Card>
        </motion.div>

        {/* GitHub Star button */}
        <a
          href="https://github.com/your-repo"
          target="_blank"
          className="fixed top-2 right-4 bg-gray-700 text-white px-4 py-2 rounded-full shadow-lg flex items-center hover:bg-gray-600"
          rel="noreferrer"
        >
          <Github className="mr-2" />
          Star on GitHub
        </a>

        {/* Analysis Results */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            </motion.div>
          )}

          {review && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                {renderMetricCard('Overall Quality', review.score, <FileCode className="h-5 w-5 text-blue-400" />)}
                {renderMetricCard('Complexity', review.complexity.score, <Lightbulb className="h-5 w-5 text-yellow-400" />)}
                {renderMetricCard('Performance', review.performance.score, <Shield className="h-5 w-5 text-green-400" />)}
              </div>

              <Card className="bg-gray-800 border-gray-700">
                <CardContent className="pt-6">
                  <Tabs defaultValue="suggestions" className="w-full">
                    <TabsList className="bg-gray-700">
                      <TabsTrigger value="suggestions">
                        Suggestions
                        <Badge variant="secondary" className="ml-2">
                          {review.suggestions.length}
                        </Badge>
                      </TabsTrigger>
                      <TabsTrigger value="security">
                        Security
                        <Badge variant="secondary" className="ml-2">
                          {review.security.length}
                        </Badge>
                      </TabsTrigger>
                      <TabsTrigger value="practices">Best Practices</TabsTrigger>
                      <TabsTrigger value="history">
                        History
                        <Badge variant="secondary" className="ml-2">
                          {history.length}
                        </Badge>
                      </TabsTrigger>
                    </TabsList>

                    <TabsContent value="suggestions" className="text-white space-y-4 mt-4">
                      <ul className="space-y-2">
                        {review.suggestions.map((suggestion, index) => (
                          <li key={index} className="flex items-start space-x-2">
                            <Lightbulb className="h-5 w-5 text-yellow-400 mt-1 flex-shrink-0" />
                            <span>{suggestion}</span>
                          </li>
                        ))}
                      </ul>
                    </TabsContent>

                    <TabsContent value="security" className="text-white space-y-4 mt-4">
                      <ul className="space-y-2">
                        {review.security.map((issue, index) => (
                          <li key={index} className="flex items-start space-x-2">
                            <Shield className="h-5 w-5 text-red-400 mt-1 flex-shrink-0" />
                            <span>{issue}</span>
                          </li>
                        ))}
                      </ul>
                    </TabsContent>

                    <TabsContent value="practices" className="text-white mt-4">
                      <div className="whitespace-pre-wrap">{review.bestPractices}</div>
                    </TabsContent>

                    <TabsContent value="history" className="text-white mt-4">
                      <div className="space-y-4">
                        {history.map((item, index) => (
                          <Card key={index} className="bg-gray-700 border-gray-600">
                            <CardContent className="pt-4">
                              <div className="flex justify-between items-center mb-2">
                                <span className="text-sm text-gray-400">
                                  {new Date(item.timestamp).toLocaleString()}
                                </span>
                                <Badge variant="secondary">
                                  Score: {item.review.score}/10
                                </Badge>
                              </div>
                              <div className="max-h-32 overflow-y-auto bg-gray-800 p-2 rounded">
                                <code className="text-sm">{item.code.slice(0, 200)}...</code>
                              </div>
                              <Button
                                variant="outline"
                                size="sm"
                                className="mt-2"
                                onClick={() => {
                                  setCode(item.code);
                                  setReview(item.review);
                                }}
                              >
                                <History className="h-4 w-4 mr-2" />
                                Load This Code
                              </Button>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    </TabsContent>
                  </Tabs>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Buy Me a Coffee Button */}
        <a
          href="https://www.buymeacoffee.com/your-profile"
          target="_blank"
          className="fixed bottom-4 right-4 bg-yellow-500 text-black px-4 py-2 rounded-full shadow-lg flex items-center hover:bg-yellow-400"
          rel="noreferrer"
        >
          <Coffee className="mr-2" />
          Buy Me a Coffee
        </a>        
      </div>
    </div>
  );
};

export default CodeReviewer;