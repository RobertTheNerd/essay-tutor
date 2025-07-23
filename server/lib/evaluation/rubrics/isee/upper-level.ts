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
    max: 4,
    type: "integer",
    labels: {
      1: "Beginning",
      2: "Developing",
      3: "Proficient",
      4: "Advanced",
    },
  },

  expectations: {
    vocabulary: "advanced",
    complexity: "complex",
    analysis: "proficient",
  },

  categories: [
    {
      id: "ideas",
      name: "Ideas & Content",
      description: "Topic development, supporting details, depth of analysis, creativity",
      color: "#9333ea", // Purple
      weight: 0.2,
    },
    {
      id: "organization",
      name: "Organization",
      description: "Structure, logical sequence, transitions, introduction and conclusion",
      color: "#22c55e", // Green
      weight: 0.2,
    },
    {
      id: "voice",
      name: "Voice & Focus",
      description: "Writer's personality, tone, clarity of message, audience awareness",
      color: "#f97316", // Orange
      weight: 0.15,
    },
    {
      id: "wordChoice",
      name: "Word Choice",
      description: "Vocabulary precision, variety, grade-appropriate language, impact",
      color: "#3b82f6", // Blue
      weight: 0.15,
    },
    {
      id: "fluency",
      name: "Sentence Fluency",
      description: "Sentence variety, rhythm, flow, readability when read aloud",
      color: "#10b981", // Teal
      weight: 0.15,
    },
    {
      id: "conventions",
      name: "Conventions",
      description: "Grammar, spelling, punctuation, capitalization, mechanics",
      color: "#ef4444", // Red
      weight: 0.15,
    },
  ],
};

// Scoring criteria for each category
export const ISEEUpperLevelCriteria = {
  ideas: {
    4: {
      description: "Clear, focused, and engaging topic with rich development",
      indicators: [
        "Compelling main idea that captures reader's interest",
        "Rich, relevant details that support and enhance the topic",
        "Creative and original thinking evident",
        "Depth of understanding and insight demonstrated",
        "Strong connection between ideas and supporting evidence",
      ],
    },
    3: {
      description: "Clear topic with adequate development and support",
      indicators: [
        "Clear main idea that is easy to identify",
        "Sufficient details that support the topic",
        "Some original thinking present",
        "Good understanding of the topic evident",
        "Ideas are generally well-supported",
      ],
    },
    2: {
      description: "Topic is emerging but development is limited",
      indicators: [
        "Main idea is present but may lack clarity",
        "Limited details or examples provided",
        "Basic understanding of topic shown",
        "Some support for ideas but insufficient",
        "Ideas may be predictable or general",
      ],
    },
    1: {
      description: "Unclear topic with minimal development",
      indicators: [
        "Main idea is unclear or missing",
        "Very few details or examples",
        "Limited understanding of topic",
        "Little or no support for ideas",
        "Ideas are underdeveloped or off-topic",
      ],
    },
  },

  organization: {
    4: {
      description: "Clear, logical structure that enhances the message",
      indicators: [
        "Compelling introduction that draws reader in",
        "Logical sequence of ideas throughout",
        "Smooth, effective transitions between ideas",
        "Strong conclusion that provides closure",
        "Structure enhances and supports the content",
      ],
    },
    3: {
      description: "Well-organized with clear beginning, middle, and end",
      indicators: [
        "Clear introduction that establishes topic",
        "Ideas are arranged in logical order",
        "Adequate transitions between paragraphs",
        "Satisfactory conclusion",
        "Structure supports the content",
      ],
    },
    2: {
      description: "Some organizational structure evident",
      indicators: [
        "Identifiable beginning, middle, and end",
        "Some attempt at logical order",
        "Limited or ineffective transitions",
        "Weak introduction or conclusion",
        "Structure may not always support content",
      ],
    },
    1: {
      description: "Little or no organizational structure",
      indicators: [
        "No clear introduction or conclusion",
        "Ideas presented randomly or confusingly",
        "No transitions between ideas",
        "Difficult to follow the writer's thinking",
        "Structure interferes with understanding",
      ],
    },
  },

  voice: {
    4: {
      description: "Strong, engaging voice that connects with audience",
      indicators: [
        "Writer's personality shines through clearly",
        "Tone is perfectly matched to audience and purpose",
        "Writing is engaging and holds reader's attention",
        "Clear sense of confidence and authority",
        "Message is focused and compelling",
      ],
    },
    3: {
      description: "Clear voice appropriate for audience and purpose",
      indicators: [
        "Writer's personality is evident",
        "Tone is appropriate for the task",
        "Writing engages the reader",
        "Shows confidence in the topic",
        "Message is clear and focused",
      ],
    },
    2: {
      description: "Voice is emerging but may be inconsistent",
      indicators: [
        "Some sense of writer's personality",
        "Tone may be uneven or inappropriate at times",
        "Writing occasionally engages reader",
        "Limited confidence evident",
        "Message may lack focus or clarity",
      ],
    },
    1: {
      description: "Little evidence of writer's voice or personality",
      indicators: [
        "Writing is flat or lifeless",
        "Tone is inappropriate for audience",
        "Fails to engage the reader",
        "No sense of writer behind the words",
        "Message is unclear or unfocused",
      ],
    },
  },

  wordChoice: {
    4: {
      description: "Precise, vivid, and sophisticated word selection",
      indicators: [
        "Words are specific, accurate, and powerful",
        "Rich vocabulary that enhances meaning",
        "Creative and memorable word combinations",
        "Language is natural and flows smoothly",
        "Advanced vocabulary used appropriately",
      ],
    },
    3: {
      description: "Clear, effective vocabulary with good variety",
      indicators: [
        "Words are generally precise and clear",
        "Good variety in word choice",
        "Vocabulary is appropriate for grade level",
        "Language conveys meaning effectively",
        "Some sophisticated vocabulary present",
      ],
    },
    2: {
      description: "Basic vocabulary with some variety attempted",
      indicators: [
        "Words are generally accurate but basic",
        "Limited variety in word choice",
        "Some attempts at more sophisticated vocabulary",
        "Meaning is usually clear",
        "Occasional repetitive language",
      ],
    },
    1: {
      description: "Limited vocabulary that may impede meaning",
      indicators: [
        "Words are basic and often imprecise",
        "Repetitive word choice",
        "Vocabulary below grade level expectations",
        "Language may confuse meaning",
        "Limited range of expression",
      ],
    },
  },

  fluency: {
    4: {
      description: "Smooth, natural flow with varied sentence structure",
      indicators: [
        "Sentences flow naturally when read aloud",
        "Excellent variety in sentence length and structure",
        "Strong rhythm and cadence throughout",
        "Sentences enhance the overall message",
        "Easy and enjoyable to read",
      ],
    },
    3: {
      description: "Good flow with some sentence variety",
      indicators: [
        "Sentences generally flow well",
        "Some variety in sentence structure",
        "Pleasant rhythm when read aloud",
        "Mostly easy to read",
        "Few awkward constructions",
      ],
    },
    2: {
      description: "Adequate flow but limited sentence variety",
      indicators: [
        "Sentences are understandable but may be choppy",
        "Limited variety in sentence structure",
        "Some awkward or repetitive constructions",
        "Adequate but not smooth when read aloud",
        "May require re-reading in places",
      ],
    },
    1: {
      description: "Poor flow with difficult-to-read sentences",
      indicators: [
        "Sentences are choppy, rambling, or confusing",
        "Little variety in sentence structure",
        "Difficult to read aloud smoothly",
        "Many awkward constructions",
        "Frequent need to re-read for understanding",
      ],
    },
  },

  conventions: {
    4: {
      description: "Excellent control of writing conventions",
      indicators: [
        "Few or no errors in grammar, spelling, or punctuation",
        "Sophisticated use of capitalization and paragraphing",
        "Strong command of complex sentence structures",
        "Conventions enhance readability",
        "Editing skills are evident",
      ],
    },
    3: {
      description: "Good control of conventions with minor errors",
      indicators: [
        "Generally correct grammar, spelling, and punctuation",
        "Proper capitalization and paragraphing",
        "Good control of sentence structure",
        "Errors don't interfere with meaning",
        "Some evidence of editing",
      ],
    },
    2: {
      description: "Adequate control with noticeable errors",
      indicators: [
        "Some errors in grammar, spelling, or punctuation",
        "Generally correct capitalization and paragraphing",
        "Basic sentence structure usually correct",
        "Errors may occasionally interfere with meaning",
        "Limited evidence of editing",
      ],
    },
    1: {
      description: "Limited control of conventions interferes with meaning",
      indicators: [
        "Frequent errors in grammar, spelling, and punctuation",
        "Problems with capitalization and paragraphing",
        "Sentence structure errors are common",
        "Errors significantly interfere with meaning",
        "Little or no evidence of editing",
      ],
    },
  },
};
