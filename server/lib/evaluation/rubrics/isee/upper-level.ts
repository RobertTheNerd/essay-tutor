// ISEE Upper Level Rubric Configuration
// Based on sample_output.html design and ISEE standards

import type { EvaluationRubric } from "../../types";

export const iseeUpperLevelRubric: EvaluationRubric = {
  id: "isee-upper",
  name: "ISEE Upper Level",
  description:
    "Independent School Entrance Examination Upper Level Essay Evaluation",
  gradeLevel: "Upper Level",

  scoringScale: {
    min: 1,
    max: 5,
    type: "integer",
    labels: {
      1: "Needs Significant Improvement",
      2: "Developing",
      3: "Proficient",
      4: "Advanced",
      5: "Exceptional",
    },
  },

  expectations: {
    vocabulary: "advanced",
    complexity: "complex",
    analysis: "proficient",
  },

  categories: [
    {
      id: "grammar",
      name: "Grammar & Mechanics",
      description: "Sentence structure, punctuation, spelling, capitalization",
      color: "#ef4444", // Red
      weight: 0.2,
    },
    {
      id: "vocabulary",
      name: "Word Choice & Vocabulary",
      description: "Advanced vocabulary, precise word choice, varied language",
      color: "#3b82f6", // Blue
      weight: 0.2,
    },
    {
      id: "structure",
      name: "Structure & Organization",
      description: "Essay organization, transitions, paragraph development",
      color: "#22c55e", // Green
      weight: 0.2,
    },
    {
      id: "development",
      name: "Development & Support",
      description: "Ideas development, examples, evidence, depth of analysis",
      color: "#9333ea", // Purple
      weight: 0.2,
    },
    {
      id: "clarity",
      name: "Clarity & Focus",
      description: "Clear thesis, coherent ideas, logical flow",
      color: "#f97316", // Orange
      weight: 0.1,
    },
    {
      id: "strengths",
      name: "Strengths & Excellence",
      description:
        "Exceptional techniques, sophisticated elements, standout qualities",
      color: "#10b981", // Teal
      weight: 0.1,
    },
  ],
};

// Scoring criteria for each category
export const ISEEUpperLevelCriteria = {
  grammar: {
    5: {
      description: "Flawless grammar and mechanics throughout",
      indicators: [
        "Perfect sentence structure with varied complexity",
        "Flawless punctuation and capitalization",
        "No spelling errors",
        "Sophisticated use of grammar constructs",
      ],
    },
    4: {
      description:
        "Strong grammar with minor errors that don't impede understanding",
      indicators: [
        "Generally correct sentence structure",
        "Mostly accurate punctuation",
        "Few minor spelling errors",
        "Good control of complex sentences",
      ],
    },
    3: {
      description: "Adequate grammar with some errors",
      indicators: [
        "Basic sentence structure mostly correct",
        "Some punctuation errors",
        "Occasional spelling mistakes",
        "Limited variety in sentence types",
      ],
    },
    2: {
      description: "Frequent errors that may impede understanding",
      indicators: [
        "Frequent sentence structure errors",
        "Consistent punctuation problems",
        "Multiple spelling errors",
        "Run-on sentences or fragments",
      ],
    },
    1: {
      description: "Serious errors that significantly impede understanding",
      indicators: [
        "Major sentence structure problems",
        "Extensive punctuation errors",
        "Numerous spelling mistakes",
        "Difficulty following due to mechanical errors",
      ],
    },
  },

  vocabulary: {
    5: {
      description: "Exceptional vocabulary with sophisticated word choice",
      indicators: [
        "Advanced vocabulary appropriate to grade level",
        "Precise and varied word choice",
        "Effective use of literary devices",
        "Demonstrates extensive vocabulary knowledge",
      ],
    },
    4: {
      description: "Strong vocabulary with good word choice variety",
      indicators: [
        "Good vocabulary for grade level",
        "Generally precise word choice",
        "Some variety in language use",
        "Appropriate academic vocabulary",
      ],
    },
    3: {
      description: "Adequate vocabulary with some variety",
      indicators: [
        "Basic vocabulary appropriate to task",
        "Occasional precise word choice",
        "Limited but acceptable variety",
        "Generally clear expression",
      ],
    },
    2: {
      description: "Limited vocabulary with repetitive word choice",
      indicators: [
        "Basic vocabulary below grade level",
        "Repetitive word choice",
        "Imprecise language",
        "Limited expression of ideas",
      ],
    },
    1: {
      description: "Very limited vocabulary impeding communication",
      indicators: [
        "Very basic vocabulary",
        "Excessive repetition",
        "Unclear expression",
        "Difficulty conveying meaning",
      ],
    },
  },

  structure: {
    5: {
      description: "Sophisticated organization with seamless flow",
      indicators: [
        "Clear, sophisticated thesis statement",
        "Logical progression of ideas",
        "Effective transitions throughout",
        "Strong introduction and conclusion",
        "Well-developed body paragraphs",
      ],
    },
    4: {
      description: "Well-organized with clear structure",
      indicators: [
        "Clear thesis statement",
        "Good organization of ideas",
        "Effective transitions between paragraphs",
        "Solid introduction and conclusion",
        "Developed body paragraphs",
      ],
    },
    3: {
      description: "Adequate organization with basic structure",
      indicators: [
        "Identifiable thesis statement",
        "Generally logical organization",
        "Some transitions present",
        "Basic introduction and conclusion",
        "Adequate paragraph development",
      ],
    },
    2: {
      description: "Weak organization with unclear structure",
      indicators: [
        "Unclear or missing thesis",
        "Poor organization of ideas",
        "Few or ineffective transitions",
        "Weak introduction or conclusion",
        "Underdeveloped paragraphs",
      ],
    },
    1: {
      description: "Poor organization impeding understanding",
      indicators: [
        "No clear thesis statement",
        "Confusing organization",
        "Missing transitions",
        "Inadequate introduction/conclusion",
        "Very poor paragraph structure",
      ],
    },
  },

  development: {
    5: {
      description: "Rich development with sophisticated analysis",
      indicators: [
        "Ideas developed with depth and insight",
        "Compelling examples and evidence",
        "Sophisticated analysis and reflection",
        "Creative and original thinking",
        "Strong support for all claims",
      ],
    },
    4: {
      description: "Good development with solid support",
      indicators: [
        "Ideas well-developed with detail",
        "Relevant examples and evidence",
        "Good analysis and explanation",
        "Clear support for main points",
        "Thoughtful development",
      ],
    },
    3: {
      description: "Adequate development with some support",
      indicators: [
        "Ideas developed with basic detail",
        "Some examples provided",
        "Basic analysis present",
        "Adequate support for claims",
        "Generally clear development",
      ],
    },
    2: {
      description: "Limited development with weak support",
      indicators: [
        "Ideas superficially developed",
        "Few or weak examples",
        "Limited analysis",
        "Insufficient support for claims",
        "Underdeveloped content",
      ],
    },
    1: {
      description: "Very limited development",
      indicators: [
        "Ideas barely developed",
        "No supporting examples",
        "No analysis or reflection",
        "Unsupported claims",
        "Very thin content",
      ],
    },
  },

  clarity: {
    5: {
      description: "Exceptional clarity with complex ideas expressed clearly",
      indicators: [
        "Crystal clear communication throughout",
        "Complex ideas made accessible",
        "Perfect coherence and flow",
        "Reader never confused",
        "Sophisticated yet clear expression",
      ],
    },
    4: {
      description: "Clear communication with good focus",
      indicators: [
        "Generally clear communication",
        "Good focus on topic",
        "Coherent flow of ideas",
        "Easy to follow",
        "Clear expression of thoughts",
      ],
    },
    3: {
      description: "Adequate clarity with basic focus",
      indicators: [
        "Mostly clear communication",
        "Adequate focus on topic",
        "Generally coherent",
        "Occasionally unclear",
        "Basic clarity maintained",
      ],
    },
    2: {
      description: "Limited clarity with unclear focus",
      indicators: [
        "Often unclear communication",
        "Poor focus on topic",
        "Incoherent in places",
        "Reader often confused",
        "Unclear expression",
      ],
    },
    1: {
      description: "Very poor clarity impeding understanding",
      indicators: [
        "Very unclear communication",
        "No clear focus",
        "Incoherent overall",
        "Very difficult to follow",
        "Meaning often unclear",
      ],
    },
  },

  strengths: {
    5: {
      description: "Multiple exceptional techniques demonstrate mastery",
      indicators: [
        "Sophisticated literary devices",
        "Exceptional creativity and originality",
        "Advanced analytical thinking",
        "Impressive depth of insight",
        "College-level sophistication",
      ],
    },
    4: {
      description: "Several strong techniques show advanced skill",
      indicators: [
        "Good use of literary devices",
        "Creative and original elements",
        "Strong analytical thinking",
        "Good insight and reflection",
        "Above grade-level performance",
      ],
    },
    3: {
      description: "Some positive techniques evident",
      indicators: [
        "Basic literary devices attempted",
        "Some creative elements",
        "Adequate analytical thinking",
        "Some personal insight",
        "Grade-appropriate performance",
      ],
    },
    2: {
      description: "Few strengths, mostly basic performance",
      indicators: [
        "Limited creative elements",
        "Basic thinking demonstrated",
        "Little personal insight",
        "Below grade-level performance",
        "Few standout qualities",
      ],
    },
    1: {
      description: "Very few strengths, significant improvement needed",
      indicators: [
        "No notable creative elements",
        "Very basic thinking",
        "No personal insight",
        "Well below grade level",
        "No standout qualities",
      ],
    },
  },
};
