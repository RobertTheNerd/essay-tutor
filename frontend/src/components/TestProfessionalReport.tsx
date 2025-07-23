import React from 'react';
import ProfessionalReport from './report/ProfessionalReport';

const TestProfessionalReport: React.FC = () => {
  // Sample evaluation data for testing
  const transformAnnotations = (annotations: any[]) => {
    const categoryColors: { [key: string]: string } = {
      'grammar': '#ef4444',
      'punctuation': '#ef4444',
      'capitalization': '#ef4444',
      'spelling': '#ef4444',
      'sentence-structure': '#10b981',
      'sentence-boundary': '#10b981',
      'precise-word': '#3b82f6',
      'smooth-phrasing': '#3b82f6',
      'clarify-idea': '#9333ea',
      'strengthen-topic-sentence': '#22c55e',
      'strengthen-conclusion': '#22c55e',
    };

    return annotations.map(ann => ({
      ...ann,
      markerId: ann.id,
      color: categoryColors[ann.type] || '#6b7280',
      severity: ann.severity as 'minor' | 'moderate' | 'major' | 'positive'
    }));
  };

  const transformFeedback = (feedback: any[]) => {
    const categoryColors: { [key: string]: string } = {
      'ideas': '#9333ea',
      'organization': '#22c55e',
      'voice': '#f97316',
      'wordChoice': '#3b82f6',
      'fluency': '#10b981',
      'conventions': '#ef4444',
      'overall': '#6b7280'
    };

    const categoryNames: { [key: string]: string } = {
      'ideas': 'Ideas & Content',
      'organization': 'Organization',
      'voice': 'Voice & Focus',
      'wordChoice': 'Word Choice',
      'fluency': 'Sentence Fluency',
      'conventions': 'Conventions',
      'overall': 'Overall'
    };

    return feedback.map(fb => ({
      id: `${fb.category}_${fb.type}`,
      category: fb.category,
      categoryName: categoryNames[fb.category] || fb.category,
      type: fb.type as 'strength' | 'improvement' | 'suggestion',
      title: fb.title,
      content: fb.content,
      color: categoryColors[fb.category] || '#6b7280',
      priority: fb.priority as 'high' | 'medium' | 'low',
      relatedAnnotations: [],
      severity: 'moderate' as 'minor' | 'moderate' | 'major' | 'positive'
    }));
  };

  const sampleEvaluation = {
    success: true,
    evaluation: {
      rubric: {
        family: "isee",
        level: "isee-upper",
        name: "ISEE Upper Level"
      },
      scores: {
        ideas: 2,
        organization: 2,
        voice: 2,
        wordChoice: 2,
        fluency: 2,
        conventions: 2
      },
      overall: 2,
      annotations: transformAnnotations([
        {
          id: "grammar_0",
          type: "grammar",
          startIndex: 213,
          endIndex: 253,
          severity: "moderate",
          originalText: "The survivor try to get a time down to 0",
          suggestedText: "The survivor tries to get a time down to 0",
          explanation: "Subject-verb agreement error; 'survivor' is singular, so the verb should be 'tries'.",
          category: "grammar"
        },
        {
          id: "precise-word_1",
          type: "precise-word",
          startIndex: 185,
          endIndex: 211,
          severity: "moderate",
          originalText: "the 2 sides compete to win",
          suggestedText: "the two sides compete to win",
          explanation: "Using '2' as a numeral is informal; numbers below 10 are generally written out in formal writing.",
          category: "precise-word"
        },
        {
          id: "grammar_2",
          type: "grammar",
          startIndex: 420,
          endIndex: 443,
          severity: "moderate",
          originalText: "the survivor have heals",
          suggestedText: "the survivor has heals",
          explanation: "Subject-verb agreement error; 'survivor' is singular, so the verb should be 'has'.",
          category: "grammar"
        },
        {
          id: "grammar_3",
          type: "grammar",
          startIndex: 526,
          endIndex: 608,
          severity: "moderate",
          originalText: "While many games have techniques or \"techs\" the often are the same and don't vary.",
          suggestedText: "While many games have techniques or \"techs,\" they often are the same and don't vary.",
          explanation: "Incorrect pronoun usage; 'the' should be 'they'.",
          category: "grammar"
        },
        {
          id: "punctuation_4",
          type: "punctuation",
          startIndex: 609,
          endIndex: 702,
          severity: "moderate",
          originalText: "For example in MM2 there is a technique called double jump which uses an item to double jump.",
          suggestedText: "For example, in MM2, there is a technique called double jump, which uses an item to double jump.",
          explanation: "Missing commas after introductory phrase and before 'which'.",
          category: "punctuation"
        },
        {
          id: "grammar_5",
          type: "grammar",
          startIndex: 703,
          endIndex: 783,
          severity: "moderate",
          originalText: "This however is the only technique and have no room to add additional movements.",
          suggestedText: "This, however, is the only technique and has no room to add additional movements.",
          explanation: "Subject-verb agreement error; 'technique' is singular, so verb should be 'has'.",
          category: "grammar"
        },
        {
          id: "sentence-structure_6",
          type: "sentence-structure",
          startIndex: 922,
          endIndex: 986,
          severity: "moderate",
          originalText: "People first pretended to be AFK or using an item then blocking.",
          suggestedText: "People first pretended to be AFK or using an item, then used blocking.",
          explanation: "Sentence is awkward and unclear; it is difficult to understand the sequence of actions.",
          category: "sentence-structure"
        },
        {
          id: "grammar_7",
          type: "grammar",
          startIndex: 987,
          endIndex: 1041,
          severity: "moderate",
          originalText: "However now there are techniques that involves emotes.",
          suggestedText: "However, now there are techniques that involve emotes.",
          explanation: "'Techniques' is plural, so verb should be 'involve'.",
          category: "grammar"
        },
        {
          id: "sentence-boundary_8",
          type: "sentence-boundary",
          startIndex: 1097,
          endIndex: 1174,
          severity: "moderate",
          originalText: "While most games like these have a map voting system to choose a certain map.",
          suggestedText: "While most games like these have a map voting system to choose a certain map, playing Forsaken has no map voting, meaning that flat maps for 1v1 or maps for John Doe aren't guaranteed.",
          explanation: "This is a sentence fragment; it should be combined with the following sentence.",
          category: "sentence-boundary"
        },
        {
          id: "clarify-idea_9",
          type: "clarify-idea",
          startIndex: 1315,
          endIndex: 1349,
          severity: "moderate",
          originalText: "This makes you better at the game.",
          suggestedText: "This forces players to adapt their strategies, which improves their skills and makes them better at the game.",
          explanation: "The idea that adapting to maps 'makes you better' is vague and could be expanded.",
          category: "clarify-idea"
        },
        {
          id: "strengthen-topic-sentence_10",
          type: "strengthen-topic-sentence",
          startIndex: 0,
          endIndex: 38,
          severity: "moderate",
          originalText: "One of my hobbies is playing Forsaken.",
          suggestedText: "One of my favorite hobbies is playing Forsaken, a game that stands out because of its unique gameplay and variety.",
          explanation: "The opening sentence is basic and does not preview the essay's main points.",
          category: "strengthen-topic-sentence"
        },
        {
          id: "strengthen-conclusion_11",
          type: "strengthen-conclusion",
          startIndex: 1351,
          endIndex: 1433,
          severity: "moderate",
          originalText: "These reasons are what make Forsaken a great game, variety and special techniques.",
          suggestedText: "These unique features—variety and special techniques—are what make Forsaken a truly great and enjoyable game.",
          explanation: "The conclusion is too brief and could be stronger by summarizing key points and providing a final thought.",
          category: "strengthen-conclusion"
        },
        {
          id: "smooth-phrasing_12",
          type: "smooth-phrasing",
          startIndex: 39,
          endIndex: 128,
          severity: "moderate",
          originalText: "Forsaken is enjoyable due to it having variety from other games and special ways to play.",
          suggestedText: "Forsaken is enjoyable because it offers more variety and unique ways to play compared to other games.",
          explanation: "Awkward phrasing; 'due to it having variety from other games' is unclear.",
                     category: "smooth-phrasing"
         }
       ]),
               feedback: transformFeedback([
        {
          category: "ideas",
          type: "strength",
          title: "Ideas & Content - Strengths",
          content: "AI identified positive aspects in ideas",
          priority: "medium"
        },
        {
          category: "ideas",
          type: "improvement",
          title: "Ideas & Content - Areas for Growth",
          content: "The essay presents a clear topic about the writer's hobby of playing the game Forsaken and attempts to explain what makes it enjoyable and unique. However, the ideas are somewhat underdeveloped and lack depth. For example, the explanation of game mechanics and techniques is vague and sometimes confusing, such as the description of techniques involving emotes. Supporting details are present but often unclear or insufficiently explained, which limits the overall impact. The essay could benefit from more specific examples and elaboration to strengthen the points made.",
          priority: "high"
        },
        {
          category: "organization",
          type: "strength",
          title: "Organization - Strengths",
          content: "AI identified positive aspects in organization",
          priority: "medium"
        },
        {
          category: "organization",
          type: "improvement",
          title: "Organization - Areas for Growth",
          content: "The essay has a basic structure with an introduction, body paragraphs, and a conclusion, but the organization lacks smooth transitions and logical flow. Paragraphs sometimes jump between ideas without clear connections, making it harder for the reader to follow. The introduction briefly introduces the topic but could better set up the essay's main points. The conclusion is very brief and does not effectively summarize or reinforce the argument. Adding clearer topic sentences and transitions would improve coherence.",
          priority: "high"
        },
        {
          category: "voice",
          type: "strength",
          title: "Voice & Focus - Strengths",
          content: "AI identified positive aspects in voice",
          priority: "medium"
        },
        {
          category: "voice",
          type: "improvement",
          title: "Voice & Focus - Areas for Growth",
          content: "The writer's voice is present but somewhat inconsistent. The tone is informal and conversational, which can be engaging but occasionally detracts from clarity and focus. Some sentences are unclear or awkwardly phrased, which affects the overall message. The essay maintains focus on the topic but sometimes strays into unclear explanations. Greater clarity and a more consistent tone appropriate for an admissions essay would strengthen the voice.",
          priority: "high"
        },
        {
          category: "wordChoice",
          type: "strength",
          title: "Word Choice - Strengths",
          content: "AI identified positive aspects in wordChoice",
          priority: "medium"
        },
        {
          category: "wordChoice",
          type: "improvement",
          title: "Word Choice - Areas for Growth",
          content: "Consider improving wordChoice",
          priority: "high"
        },
        {
          category: "fluency",
          type: "strength",
          title: "Sentence Fluency - Strengths",
          content: "AI identified positive aspects in fluency",
          priority: "medium"
        },
        {
          category: "fluency",
          type: "improvement",
          title: "Sentence Fluency - Areas for Growth",
          content: "Consider improving fluency",
          priority: "high"
        },
        {
          category: "conventions",
          type: "strength",
          title: "Conventions - Strengths",
          content: "AI identified positive aspects in conventions",
          priority: "medium"
        },
        {
          category: "conventions",
          type: "improvement",
          title: "Conventions - Areas for Growth",
          content: "The essay contains multiple grammar, punctuation, and spelling errors that interfere with clarity. Issues include subject-verb agreement ('The survivor try'), missing commas, inconsistent capitalization, and awkward phrasing. While the errors do not completely obscure meaning, they distract the reader and reduce the essay's professionalism. Careful proofreading and attention to basic conventions would greatly improve the writing.",
          priority: "high"
        },
        {
          category: "overall",
          type: "suggestion",
          title: "Next Steps for Improvement",
          content: "Focus on expanding and clarifying your main ideas with specific examples. Work on organizing your essay with clear topic sentences and transitions to improve flow. Carefully proofread your writing to correct grammar and punctuation errors. Practice varying sentence structures to make your writing more engaging and easier to read.",
                     priority: "high"
         }
       ]),
       paragraphFeedback: [
        {
          paragraphNumber: 1,
          title: "Basic Introduction",
          content: "This paragraph introduces the topic and states that Forsaken is enjoyable due to its variety and special ways to play. However, it is very brief and lacks a clear thesis or preview of the main points. The sentence structure is simple and could be more engaging.",
          type: "needs-improvement" as const,
          priority: "high" as const
        },
        {
          paragraphNumber: 2,
          title: "Explanation of Game Mechanics",
          content: "This paragraph attempts to explain the basic gameplay of Forsaken, including the survivor and killer roles. While it provides some details, the explanation is confusing and contains grammatical errors. The paragraph lacks clear topic sentences and transitions, making it hard to follow.",
          type: "needs-improvement" as const,
          priority: "high" as const
        },
        {
          paragraphNumber: 3,
          title: "Comparison of Techniques",
          content: "The paragraph tries to distinguish Forsaken from other games by discussing the variety of techniques. It includes an example but is unclear and somewhat disorganized. The explanation of techniques and their uniqueness needs more development and clarity.",
          type: "needs-improvement" as const,
          priority: "high" as const
        },
        {
          paragraphNumber: 4,
          title: "Discussion of Map Variety",
          content: "This paragraph highlights the lack of map voting in Forsaken and how it requires players to adapt. The idea is interesting but not fully developed or clearly connected to the essay's main argument. The writing contains awkward phrasing and grammatical errors.",
          type: "needs-improvement" as const,
          priority: "medium" as const
        },
        {
          paragraphNumber: 5,
          title: "Brief Conclusion",
          content: "The conclusion restates the main reasons Forsaken is a great game but is very brief and lacks a strong closing statement. It does not effectively summarize or leave a lasting impression.",
          type: "needs-improvement" as const,
          priority: "medium" as const
        }
      ],
      summary: {
        strengths: [
          "The essay clearly identifies the topic and attempts to explain what makes the game Forsaken unique.",
          "The writer includes some specific gaming terms and examples, showing familiarity with the subject.",
          "The essay maintains a consistent focus on the game Forsaken throughout."
        ],
        improvements: [
          "Develop ideas more fully with clearer explanations and stronger supporting details.",
          "Improve organization by adding clearer topic sentences, transitions, and a stronger conclusion.",
          "Address grammar, punctuation, and sentence structure errors to enhance clarity and professionalism."
        ],
        nextSteps: "Focus on expanding and clarifying your main ideas with specific examples. Work on organizing your essay with clear topic sentences and transitions to improve flow. Carefully proofread your writing to correct grammar and punctuation errors. Practice varying sentence structures to make your writing more engaging and easier to read."
      },
      metadata: {
        processingTime: 17131,
        timestamp: "2025-07-23T17:03:04.245Z",
        confidence: 0.85
      }
    }
  };

  // Sample essay text to display annotations on
  const sampleEssayText = `One of my hobbies is playing Forsaken. Forsaken is enjoyable due to it having variety from other games and special ways to play.

Forsaken is a 1 v 4 survival horror game where the 2 sides compete to win. The survivor try to get a time down to 0 by fixing generators or doing objectives. When a survivor gets caught by the killer they get put on a hook. If they get hooked three times they die. If a survivor doesn't get saved from a hook in a certain amount of time, they also die. The killer wins by killing all the survivors. To help survivors, the survivor have heals which can heal other survivors or yourself.

While many games have techniques or "techs" the often are the same and don't vary. For example in MM2 there is a technique called double jump which uses an item to double jump. This however is the only technique and have no room to add additional movements. In contrast to this Forsaken has many techniques. People first pretended to be AFK or using an item then blocking. However now there are techniques that involves emotes. Like crouching and then standing can increase your movement speed, and spinning can help block the killer's vision.

While most games like these have a map voting system to choose a certain map. However, playing Forsaken has no map voting, meaning that flat maps for 1v1 or maps for John Doe aren't guaranteed. This makes you better at the game.

These reasons are what make Forsaken a great game, variety and special techniques.`;

  const testPrompt = "What is one of your favorite hobbies? Why do you enjoy this hobby?"

  const testStudentInfo = {
    name: "Test Student",
    date: new Date().toLocaleDateString(),
    gradeLevel: "ISEE Upper Level",
    score: "1.9"
  }

  return (
    <div className="test-professional-report">
      <div style={{ padding: '20px', backgroundColor: '#f5f5f5', marginBottom: '20px' }}>
        <h1>Professional Report Test Page</h1>
        <p>This page demonstrates the ProfessionalReport component with sample evaluation data.</p>
        <div style={{ display: 'flex', gap: '20px', marginTop: '10px' }}>
          <button 
            onClick={() => window.print()}
            style={{
              padding: '10px 20px',
              backgroundColor: '#007bff',
              color: 'white',
              border: 'none',
              borderRadius: '5px',
              cursor: 'pointer'
            }}
          >
            Print Report
          </button>
          <div style={{ fontSize: '14px', color: '#666' }}>
            Overall Score: {sampleEvaluation.evaluation.overall} | 
            ISEE Level: {sampleEvaluation.evaluation.rubric.level} |
            Annotations: {sampleEvaluation.evaluation.annotations?.length || 0}
          </div>
        </div>
      </div>

      <ProfessionalReport
        evaluationData={sampleEvaluation.evaluation}
        essayText={sampleEssayText}
        prompt={testPrompt}
        studentInfo={testStudentInfo}
      />
    </div>
  )
}

export default TestProfessionalReport 