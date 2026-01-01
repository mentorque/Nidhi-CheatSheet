import { useState } from 'react';
import { CheckCircle, XCircle, AlertCircle, Eye } from 'lucide-react';

const TestValidator = () => {
  const [jsonInput, setJsonInput] = useState('');
  const [validationResult, setValidationResult] = useState(null);
  const [showPreview, setShowPreview] = useState(false);

  const validateJSON = () => {
    // Reset state
    setValidationResult(null);
    setShowPreview(false);

    // Step 1: Check if JSON is valid
    let parsedData;
    try {
      parsedData = JSON.parse(jsonInput);
    } catch (err) {
      setValidationResult({
        isValid: false,
        canRender: false,
        errors: [`Invalid JSON: ${err.message}`],
        warnings: [],
        data: null
      });
      return;
    }

    const errors = [];
    const warnings = [];
    let canRender = true;

    // Step 2: Check required top-level fields
    if (!parsedData.name || typeof parsedData.name !== 'string') {
      errors.push('Missing or invalid "name" field (must be a string)');
      canRender = false;
    }

    if (!parsedData.role || typeof parsedData.role !== 'string') {
      warnings.push('Missing or invalid "role" field (recommended)');
    }

    if (!parsedData.description || typeof parsedData.description !== 'string') {
      warnings.push('Missing or invalid "description" field (recommended)');
    }

    // Step 3: Check sections array
    if (!parsedData.sections || !Array.isArray(parsedData.sections)) {
      errors.push('Missing or invalid "sections" field (must be an array)');
      canRender = false;
    } else if (parsedData.sections.length === 0) {
      errors.push('"sections" array is empty');
      canRender = false;
    } else {
      // Validate each section
      parsedData.sections.forEach((section, sectionIndex) => {
        const sectionPrefix = `Section ${sectionIndex + 1}`;

        // Check section title
        if (!section.title || typeof section.title !== 'string') {
          errors.push(`${sectionPrefix}: Missing or invalid "title" field`);
          canRender = false;
        }

        // Check section icon
        if (!section.icon || typeof section.icon !== 'string') {
          errors.push(`${sectionPrefix}: Missing or invalid "icon" field (must be a string like "Users", "Target", "Award")`);
          canRender = false;
        } else {
          const validIcons = ['Users', 'Target', 'Award', 'CheckCircle', 'Star', 'Clock', 'Zap', 'RotateCcw'];
          if (!validIcons.includes(section.icon)) {
            warnings.push(`${sectionPrefix}: Icon "${section.icon}" may not be supported. Valid icons: ${validIcons.join(', ')}`);
          }
        }

        // Check cards array
        if (!section.cards || !Array.isArray(section.cards)) {
          errors.push(`${sectionPrefix}: Missing or invalid "cards" field (must be an array)`);
          canRender = false;
        } else if (section.cards.length === 0) {
          warnings.push(`${sectionPrefix}: "cards" array is empty`);
        } else {
          // Validate each card
          section.cards.forEach((card, cardIndex) => {
            if (!card.front || typeof card.front !== 'string') {
              errors.push(`${sectionPrefix}, Card ${cardIndex + 1}: Missing or invalid "front" field`);
              canRender = false;
            }
            if (!card.back || typeof card.back !== 'string') {
              errors.push(`${sectionPrefix}, Card ${cardIndex + 1}: Missing or invalid "back" field`);
              canRender = false;
            }
          });
        }

        // Check quiz array
        if (!section.quiz || !Array.isArray(section.quiz)) {
          warnings.push(`${sectionPrefix}: Missing or invalid "quiz" field (recommended, but not required)`);
        } else if (section.quiz.length === 0) {
          warnings.push(`${sectionPrefix}: "quiz" array is empty`);
        } else {
          // Validate each quiz question
          section.quiz.forEach((quizItem, quizIndex) => {
            if (!quizItem.question || typeof quizItem.question !== 'string') {
              errors.push(`${sectionPrefix}, Quiz ${quizIndex + 1}: Missing or invalid "question" field`);
              canRender = false;
            }
            if (typeof quizItem.answer !== 'boolean') {
              errors.push(`${sectionPrefix}, Quiz ${quizIndex + 1}: Missing or invalid "answer" field (must be true or false)`);
              canRender = false;
            }
          });
        }
      });
    }

    // Step 4: Check for extra fields (warnings only)
    const expectedFields = ['name', 'role', 'description', 'sections'];
    const extraFields = Object.keys(parsedData).filter(key => !expectedFields.includes(key));
    if (extraFields.length > 0) {
      warnings.push(`Unexpected fields found (will be ignored): ${extraFields.join(', ')}`);
    }

    setValidationResult({
      isValid: errors.length === 0,
      canRender: canRender && errors.length === 0,
      errors,
      warnings,
      data: canRender ? parsedData : null
    });
  };

  const handlePreview = () => {
    if (validationResult && validationResult.canRender) {
      setShowPreview(true);
    }
  };

  return (
    <div className="min-h-screen bg-black py-8 px-4 sm:px-6 md:px-8 lg:px-12">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center">
              <div className="w-6 h-6 bg-black rounded-sm"></div>
            </div>
            <span className="text-white font-bold text-2xl">Mentorque</span>
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl text-white font-bold mb-4">
            JSON Validator & Tester
          </h1>
          <p className="text-gray-300 text-lg">
            Paste your cheatsheet JSON below to validate its structure
          </p>
          <div className="mt-4 p-4 bg-blue-400/10 border border-blue-400/20 rounded-lg">
            <p className="text-blue-300 text-sm font-semibold mb-2">📋 Copy This Prompt:</p>
            <p className="text-white text-xs font-mono bg-black/50 p-3 rounded border border-white/10 select-all">
              Generate JSON: name, role, description, sections[3]. Each section: title, icon (Users/Target/Award), cards[], quiz[3]. Quiz MANDATORY: question (string), answer (boolean).
            </p>
          </div>
          <button
            onClick={() => {
              const sampleJSON = {
                "name": "John Doe",
                "role": "Software Engineer",
                "description": "Tailored to your experience in software development",
                "sections": [
                  {
                    "title": "Behavioral Questions",
                    "icon": "Users",
                    "cards": [
                      {
                        "front": "Tell me about yourself",
                        "back": "I'm a software engineer with experience in..."
                      }
                    ],
                    "quiz": [
                      {
                        "question": "Should you use the STAR method?",
                        "answer": true
                      }
                    ]
                  }
                ]
              };
              setJsonInput(JSON.stringify(sampleJSON, null, 2));
            }}
            className="mt-4 px-4 py-2 bg-white/10 text-white rounded-lg hover:bg-white/20 transition-colors text-sm"
          >
            Load Sample JSON
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left: Input */}
          <div className="space-y-4">
            <div className="backdrop-blur-xl bg-white/[0.02] border border-white/10 rounded-2xl p-6">
              <label className="block text-white font-semibold mb-3">
                Paste JSON Here:
              </label>
              <textarea
                value={jsonInput}
                onChange={(e) => setJsonInput(e.target.value)}
                placeholder='{\n  "name": "John Doe",\n  "role": "Software Engineer",\n  "description": "...",\n  "sections": [...]\n}'
                className="w-full h-96 bg-black/50 border border-white/20 rounded-xl p-4 text-white font-mono text-sm focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-400/20 resize-none"
              />
              <div className="flex gap-3 mt-4">
                <button
                  onClick={validateJSON}
                  className="flex-1 px-6 py-3 bg-blue-400 text-white rounded-xl font-medium hover:bg-blue-500 transition-all duration-300 shadow-lg shadow-blue-400/30"
                >
                  Validate JSON
                </button>
                {validationResult?.canRender && (
                  <button
                    onClick={handlePreview}
                    className="px-6 py-3 bg-green-400 text-white rounded-xl font-medium hover:bg-green-500 transition-all duration-300 flex items-center gap-2"
                  >
                    <Eye className="w-5 h-5" />
                    Preview
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Right: Results */}
          <div className="space-y-4">
            {validationResult && (
              <div className="backdrop-blur-xl bg-white/[0.02] border border-white/10 rounded-2xl p-6">
                <div className="flex items-center gap-3 mb-4">
                  {validationResult.canRender ? (
                    <CheckCircle className="w-8 h-8 text-green-400" />
                  ) : (
                    <XCircle className="w-8 h-8 text-red-400" />
                  )}
                  <h2 className="text-2xl font-bold text-white">
                    {validationResult.canRender ? 'Valid & Renderable' : 'Invalid or Cannot Render'}
                  </h2>
                </div>

                {/* Errors */}
                {validationResult.errors.length > 0 && (
                  <div className="mb-4">
                    <div className="flex items-center gap-2 mb-2">
                      <XCircle className="w-5 h-5 text-red-400" />
                      <h3 className="text-lg font-semibold text-red-400">
                        Errors ({validationResult.errors.length})
                      </h3>
                    </div>
                    <ul className="space-y-2">
                      {validationResult.errors.map((error, index) => (
                        <li key={index} className="text-red-300 text-sm bg-red-400/10 border border-red-400/20 rounded-lg p-3">
                          {error}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Warnings */}
                {validationResult.warnings.length > 0 && (
                  <div className="mb-4">
                    <div className="flex items-center gap-2 mb-2">
                      <AlertCircle className="w-5 h-5 text-yellow-400" />
                      <h3 className="text-lg font-semibold text-yellow-400">
                        Warnings ({validationResult.warnings.length})
                      </h3>
                    </div>
                    <ul className="space-y-2">
                      {validationResult.warnings.map((warning, index) => (
                        <li key={index} className="text-yellow-300 text-sm bg-yellow-400/10 border border-yellow-400/20 rounded-lg p-3">
                          {warning}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Success Summary */}
                {validationResult.canRender && (
                  <div className="bg-green-400/10 border border-green-400/20 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <CheckCircle className="w-5 h-5 text-green-400" />
                      <h3 className="text-lg font-semibold text-green-400">Validation Summary</h3>
                    </div>
                    <ul className="text-green-300 text-sm space-y-1">
                      <li>✓ Valid JSON structure</li>
                      <li>✓ All required fields present</li>
                      <li>✓ {validationResult.data.sections.length} section(s) found</li>
                      <li>✓ {validationResult.data.sections.reduce((sum, s) => sum + (s.cards?.length || 0), 0)} card(s) total</li>
                      <li>✓ {validationResult.data.sections.reduce((sum, s) => sum + (s.quiz?.length || 0), 0)} quiz question(s) total</li>
                      <li className="mt-2 font-semibold">This JSON can be rendered successfully!</li>
                    </ul>
                  </div>
                )}
              </div>
            )}

            {/* Preview */}
            {showPreview && validationResult?.data && (
              <div className="backdrop-blur-xl bg-white/[0.02] border border-white/10 rounded-2xl p-6">
                <h3 className="text-xl font-bold text-white mb-4">Preview</h3>
                <div className="bg-black/50 rounded-lg p-4 text-white">
                  <div className="mb-4">
                    <p className="text-gray-400 text-sm">Name:</p>
                    <p className="text-blue-400 font-semibold">{validationResult.data.name}</p>
                  </div>
                  {validationResult.data.role && (
                    <div className="mb-4">
                      <p className="text-gray-400 text-sm">Role:</p>
                      <p className="text-white">{validationResult.data.role}</p>
                    </div>
                  )}
                  {validationResult.data.description && (
                    <div className="mb-4">
                      <p className="text-gray-400 text-sm">Description:</p>
                      <p className="text-gray-300 text-sm">{validationResult.data.description}</p>
                    </div>
                  )}
                  <div>
                    <p className="text-gray-400 text-sm mb-2">Sections:</p>
                    <div className="space-y-2">
                      {validationResult.data.sections.map((section, index) => (
                        <div key={index} className="bg-white/5 rounded p-2">
                          <p className="text-white font-medium">{section.title}</p>
                          <p className="text-gray-400 text-xs">
                            {section.cards?.length || 0} cards, {section.quiz?.length || 0} quiz questions
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {!validationResult && (
              <div className="backdrop-blur-xl bg-white/[0.02] border border-white/10 rounded-2xl p-6 text-center">
                <p className="text-gray-400">Validation results will appear here</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TestValidator;

