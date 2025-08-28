---
description: Explain the repository structure and key components
argument-hint: ""
allowed-tools: Task
---

# Intent

Provide a comprehensive overview of the repository to help users understand the codebase structure, key components, and areas of interest.

# Implementation

Use the general-purpose agent to analyze the repository and provide a contextually-aware technical assessment covering:

## 1. Project Context & Purpose
What does this project do, who is it for, and what ecosystem does it operate in?

## 2. Code Quality & Architecture  
Code organization, design decisions, dependencies, and technical implementation quality.

## 3. Security & Risk Assessment
Security concerns appropriate to the project's deployment model and execution environment.

## 4. Critical Issues & Recommendations
Immediate problems, technical debt, and prioritized improvement suggestions.

**Instructions for Agent:**
- **First identify the project ecosystem** - examine file patterns, directory structure, and configuration to understand the target platform/framework
- **Apply domain-appropriate criteria** - don't use generic software evaluation patterns if this is a specialized environment (CLI tools, web frameworks, embedded systems, development extensions, etc.)
- **Research unfamiliar domains** - investigate the specific execution and security model before making assumptions
- **Be constructive and specific** - support assessments with code examples, consider the project's stated goals, and provide actionable feedback