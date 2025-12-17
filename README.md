🧠 Cognitive Tutor: One-Document → Mastery

> Teaching understanding, not answers.




---

🚀 Overview

Cognitive Tutor is a reasoning-first AI learning platform that transforms any large document into a personalized mastery experience using a single deep reasoning pass and single-turn evaluations.

Unlike traditional PDF chatbots, Cognitive Tutor:

Analyzes a document only once

Generates complex, rubric-backed questions

Delivers personalized feedback without reprocessing context


This project was built for Theme 2: Reasoning and Personalized Experience (Maximized Context).


---

🎯 Problem Statement

Most AI learning tools today:

Rely on shallow summarization

Repeatedly re-send the same document to the model

Measure recall instead of understanding

Waste tokens and compute


As a result, they fail to:

Assess deep comprehension

Personalize learning efficiently

Scale to large or complex documents



---

💡 Our Solution

Cognitive Tutor introduces a two-phase reasoning architecture:

1. One-time document intelligence


2. Single-turn, rubric-based evaluation



This ensures:

Deep understanding

Accurate feedback

Minimal API usage



---

🧠 Key Features

✅ One-Time Deep Document Analysis

Uses Gemini’s long-context reasoning

Extracts:

Core themes

Implicit assumptions

Cross-section links

Difficulty gradients



📌 Happens exactly once per document.


---

🧩 Reasoning-Heavy Question Generation

Generates 5 unique, complex questions

Focuses on:

Synthesis

Evaluation

Application


Each question includes a hidden grading rubric



---

🧪 Single-Turn Answer Evaluation

Evaluates answers in one Gemini call

Measures:

Conceptual accuracy

Depth of reasoning

Missing ideas


Produces personalized feedback, not follow-up questions



---

🎯 Personalized Learning (Without Extra Calls)

Maintains a local learner memory:

Strengths

Gaps

Feedback preferences


Adapts feedback tone and focus automatically


❌ No document re-analysis
❌ No multi-turn probing


---

🏗️ System Architecture

User
 └── Web UI (React + Tailwind)
      └── Backend (Node.js + Express)
           ├── Gemini Call #1
           │    └── Document Intelligence
           │         ├── Concepts
           │         ├── Assumptions
           │         └── Questions + Rubrics
           │
           ├── Gemini Call #2+
           │    └── Single-Turn Evaluations
           │
           └── Local JSON Memory Store


---

📂 Data Models

📘 Document Intelligence

{
  "core_themes": [],
  "implicit_assumptions": [],
  "cross_section_links": [],
  "difficulty_map": {}
}

❓ Question Object

{
  "id": "Q1",
  "question_text": "",
  "targets": ["analysis", "synthesis"],
  "rubric": {
    "key_points": [],
    "depth_markers": [],
    "common_misconceptions": []
  }
}

👤 Learner Memory

{
  "strengths": [],
  "gaps": [],
  "feedback_preference": "concise | detailed"
}


---

🧠 Gemini Prompt Design

Prompt 1 — Document Intelligence

Processes entire document

Generates:

Concept map

5 deep questions

Evaluation rubrics


Output: Strict JSON only


Prompt 2 — Answer Evaluation

Inputs:

Question

User answer

Rubric

Learner memory


Output:


{
  "score_band": "High | Medium | Developing",
  "feedback": "",
  "missed_concept": "",
  "next_learning_suggestion": ""
}


---

🛠️ Tech Stack

Layer Technology

Frontend React + Tailwind CSS
Backend Node.js + Express
AI Gemini (Google AI Studio)
Storage In-memory JSON
PDF Parsing pdf-parse




