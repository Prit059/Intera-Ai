// components/PdfQuestionUploader.jsx
import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { FiUpload, FiFile, FiX, FiCheckCircle, FiAlertCircle, FiDownload } from 'react-icons/fi';
import { toast } from 'react-hot-toast';
import * as pdfjs from 'pdfjs-dist';

// Set up pdf.js worker
pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;

function PdfQuestionUploader({ onQuestionsParsed, onClose }) {
  const [file, setFile] = useState(null);
  const [parsing, setParsing] = useState(false);
  const [parsedQuestions, setParsedQuestions] = useState([]);
  const [previewMode, setPreviewMode] = useState(false);

  // Sample PDF format template
  const downloadSamplePdf = () => {
    const sampleContent = `APTITUDE TEST QUESTIONS

Question 1:
What is the value of x if 2x + 5 = 15?
A) 5
B) 10
C) 7.5
D) 5.5
Correct: A
Explanation: Subtract 5 from both sides: 2x = 10, then divide by 2: x = 5
Difficulty: Easy
Type: Multiple Choice (MCQ)

Question 2:
A train 100 meters long passes a pole in 5 seconds. What is its speed in km/h?
A) 72 km/h
B) 36 km/h
C) 54 km/h
D) 20 km/h
Correct: A
Explanation: Speed = distance/time = 100/5 = 20 m/s. Convert to km/h: 20 × 18/5 = 72 km/h
Difficulty: Medium
Type: Multiple Choice (MCQ)

Question 3:
All squares are rectangles.
A) True
B) False
Correct: True
Explanation: A square has all properties of a rectangle (opposite sides equal, all angles 90°)
Difficulty: Easy
Type: True/False

Question 4:
The value of π is approximately ______.
Correct: 3.14
Explanation: Pi is approximately 3.14159...
Difficulty: Easy
Type: Fill in the Blanks

Question 5:
If 15 workers can build a wall in 20 days, how many days will 10 workers take?
A) 30 days
B) 25 days
C) 40 days
D) 15 days
Correct: A
Explanation: More workers = less days. 15 workers → 20 days, so 1 worker → 300 days, 10 workers → 30 days
Difficulty: Hard
Type: Multiple Choice (MCQ)`;

    const blob = new Blob([sampleContent], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'sample_questions.txt';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const onDrop = useCallback((acceptedFiles) => {
    if (acceptedFiles.length > 0) {
      const file = acceptedFiles[0];
      if (file.type === 'application/pdf' || file.name.endsWith('.txt')) {
        setFile(file);
        setParsedQuestions([]);
      } else {
        toast.error('Please upload a PDF or TXT file');
      }
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'text/plain': ['.txt']
    },
    maxFiles: 1
  });

  const parsePDF = async (file) => {
    try {
      const arrayBuffer = await file.arrayBuffer();
      const pdf = await pdfjs.getDocument({ data: arrayBuffer }).promise;
      let fullText = '';

      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const textContent = await page.getTextContent();
        const pageText = textContent.items.map(item => item.str).join(' ');
        fullText += pageText + '\n';
      }

      return fullText;
    } catch (error) {
      console.error('Error parsing PDF:', error);
      throw new Error('Failed to parse PDF file');
    }
  };

  const parseQuestions = (text) => {
    const questions = [];
    
    // Split by "Question" or numbered patterns
    const questionBlocks = text.split(/Question\s*\d+:|^\d+\./gm).filter(block => block.trim());
    
    questionBlocks.forEach(block => {
      try {
        const question = {
          questionText: "",
          questionType: "Multiple Choice (MCQ)",
          options: [],
          correctAnswer: null,
          explanation: "",
          marks: 1,
          difficulty: "Medium"
        };

        const lines = block.split('\n').filter(line => line.trim());

        // Extract question text (first non-empty line that doesn't start with A), B), etc.)
        for (let line of lines) {
          line = line.trim();
          if (line && !line.match(/^[A-D]\)|^Correct:|^Explanation:|^Difficulty:|^Type:/i)) {
            if (!question.questionText) {
              question.questionText = line;
              continue;
            }
          }

          // Extract options (A), B), etc.)
          const optionMatch = line.match(/^([A-D])\)\s*(.+)/i);
          if (optionMatch) {
            const optionIndex = optionMatch[1].toUpperCase().charCodeAt(0) - 65; // A=0, B=1, etc.
            question.options[optionIndex] = optionMatch[2];
          }

          // Extract correct answer
          if (line.match(/^Correct:/i)) {
            const correctValue = line.replace(/^Correct:/i, '').trim();
            if (correctValue.match(/^[A-D]$/i)) {
              // For MCQ - store as index
              question.correctAnswer = correctValue.toUpperCase().charCodeAt(0) - 65;
            } else if (correctValue.toLowerCase() === 'true' || correctValue.toLowerCase() === 'false') {
              // For True/False
              question.correctAnswer = correctValue.toLowerCase() === 'true';
              question.questionType = "True/False";
            } else {
              // For fill in blanks or short answer
              question.correctAnswer = correctValue;
              if (!question.questionType || question.questionType === "Multiple Choice (MCQ)") {
                question.questionType = "Fill in the Blanks";
              }
            }
          }

          // Extract explanation
          if (line.match(/^Explanation:/i)) {
            question.explanation = line.replace(/^Explanation:/i, '').trim();
          }

          // Extract difficulty
          if (line.match(/^Difficulty:/i)) {
            const diff = line.replace(/^Difficulty:/i, '').trim();
            if (['Easy', 'Medium', 'Hard', 'Very Hard'].includes(diff)) {
              question.difficulty = diff;
            }
          }

          // Extract question type
          if (line.match(/^Type:/i)) {
            const type = line.replace(/^Type:/i, '').trim();
            if (['Multiple Choice (MCQ)', 'True/False', 'Multiple Response', 'Fill in the Blanks', 'Short Answer'].includes(type)) {
              question.questionType = type;
            }
          }
        }

        // Clean up options array
        question.options = question.options.filter(opt => opt && opt.trim());

        // Validate question
        if (question.questionText && question.correctAnswer !== null && question.correctAnswer !== undefined) {
          // For MCQ, ensure we have at least 2 options
          if (question.questionType === "Multiple Choice (MCQ)" && question.options.length < 2) {
            // Add default options if missing
            question.options = ["Option A", "Option B", "Option C", "Option D"];
          }
          questions.push(question);
        }
      } catch (error) {
        console.error('Error parsing question block:', error);
      }
    });

    return questions;
  };

  const handleParse = async () => {
    if (!file) {
      toast.error('Please select a file');
      return;
    }

    setParsing(true);
    try {
      let text;
      if (file.type === 'application/pdf') {
        text = await parsePDF(file);
      } else {
        text = await file.text();
      }

      const questions = parseQuestions(text);
      
      if (questions.length === 0) {
        toast.error('No valid questions found in the file');
      } else {
        setParsedQuestions(questions);
        setPreviewMode(true);
        toast.success(`Successfully parsed ${questions.length} questions!`);
      }
    } catch (error) {
      console.error('Error parsing file:', error);
      toast.error('Failed to parse file. Please check the format.');
    } finally {
      setParsing(false);
    }
  };

  const handleImport = () => {
    onQuestionsParsed(parsedQuestions);
    onClose();
    toast.success(`${parsedQuestions.length} questions imported successfully!`);
  };

  const removeFile = () => {
    setFile(null);
    setParsedQuestions([]);
    setPreviewMode(false);
  };

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-800 rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-700 flex justify-between items-center">
          <h2 className="text-xl font-semibold">Import Questions from PDF</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white">
            <FiX size={24} />
          </button>
        </div>

        <div className="p-6">
          {/* Sample PDF Button */}
          <div className="mb-6 p-4 bg-blue-900/20 rounded-lg border border-blue-600">
            <h3 className="font-semibold mb-2 flex items-center gap-2">
              <FiDownload className="text-blue-400" />
              Need a template?
            </h3>
            <p className="text-sm text-gray-400 mb-3">
              Download a sample file to see the required format
            </p>
            <button
              onClick={downloadSamplePdf}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 rounded-lg hover:bg-blue-700 text-sm"
            >
              <FiDownload size={16} />
              Download Sample Format
            </button>
          </div>

          {!previewMode ? (
            <>
              {/* Dropzone */}
              <div
                {...getRootProps()}
                className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors
                  ${isDragActive ? 'border-blue-500 bg-blue-500/10' : 'border-gray-600 hover:border-gray-500'}`}
              >
                <input {...getInputProps()} />
                {file ? (
                  <div className="flex items-center justify-center gap-3">
                    <FiFile className="text-blue-400" size={24} />
                    <span className="text-white">{file.name}</span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        removeFile();
                      }}
                      className="text-red-400 hover:text-red-300"
                    >
                      <FiX />
                    </button>
                  </div>
                ) : (
                  <div>
                    <FiUpload className="mx-auto mb-3 text-gray-400" size={32} />
                    <p className="text-gray-400 mb-2">
                      Drag & drop a PDF or TXT file here, or click to select
                    </p>
                    <p className="text-sm text-gray-500">
                      Supported formats: .pdf, .txt
                    </p>
                  </div>
                )}
              </div>

              {/* Parse Button */}
              {file && (
                <button
                  onClick={handleParse}
                  disabled={parsing}
                  className="mt-4 w-full px-4 py-3 bg-green-600 rounded-lg hover:bg-green-700 disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {parsing ? (
                    <>
                      <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
                      Parsing...
                    </>
                  ) : (
                    <>
                      <FiCheckCircle />
                      Parse Questions
                    </>
                  )}
                </button>
              )}
            </>
          ) : (
            /* Preview Mode */
            <div>
              <h3 className="font-semibold mb-3">
                Found {parsedQuestions.length} Questions
              </h3>
              
              <div className="space-y-3 max-h-96 overflow-y-auto mb-4">
                {parsedQuestions.map((q, idx) => (
                  <div key={idx} className="bg-gray-700 p-3 rounded-lg">
                    <div className="flex justify-between items-start mb-2">
                      <span className="font-medium text-sm">Q{idx + 1}</span>
                      <span className="text-xs px-2 py-1 bg-blue-600 rounded-full">
                        {q.questionType}
                      </span>
                    </div>
                    <p className="text-sm mb-2">{q.questionText}</p>
                    {q.options.length > 0 && (
                      <div className="grid grid-cols-2 gap-1 mb-2 text-xs">
                        {q.options.map((opt, optIdx) => (
                          <div key={optIdx} className="flex items-center gap-1">
                            <span className="text-gray-400">{String.fromCharCode(65 + optIdx)}):</span>
                            <span className="truncate">{opt}</span>
                          </div>
                        ))}
                      </div>
                    )}
                    <div className="flex gap-2 text-xs">
                      <span className="text-green-400">
                        ✓ {typeof q.correctAnswer === 'number' 
                          ? String.fromCharCode(65 + q.correctAnswer) 
                          : q.correctAnswer?.toString()}
                      </span>
                      <span className="text-yellow-400">{q.difficulty}</span>
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setPreviewMode(false)}
                  className="flex-1 px-4 py-2 bg-gray-700 rounded-lg hover:bg-gray-600"
                >
                  Back
                </button>
                <button
                  onClick={handleImport}
                  className="flex-1 px-4 py-2 bg-green-600 rounded-lg hover:bg-green-700"
                >
                  Import {parsedQuestions.length} Questions
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default PdfQuestionUploader;