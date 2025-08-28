---
description: Explain the repository structure and key components
argument-hint: ""
allowed-tools: Task
---

# Intent

Provide a comprehensive overview of the repository to help users understand the codebase structure, key components, and areas of interest.

# Implementation

Use the general-purpose agent to analyze the repository and provide a structured, honest technical assessment covering:

## 1. Project Overview
- **Purpose & Goals** - What the project does and claims to achieve
- **Target Audience** - Who it's designed for and their needs
- **Value Proposition** - What makes it different or valuable

## 2. Code Quality Assessment
- **Maintainability** - Code organization, naming, documentation quality
- **Complexity** - Unnecessarily complex patterns, over-engineering, or oversimplification
- **Consistency** - Style adherence, patterns, conventions
- **Error Handling** - Robustness and failure scenarios
- **Test Coverage** - Presence and quality of tests

## 3. Architecture & Design Critique
- **Design Decisions** - Evaluate architectural choices and trade-offs
- **Scalability** - Growth limitations and bottlenecks
- **Modularity** - Component separation and reusability
- **Dependencies** - External dependencies and their risks
- **Performance** - Potential performance issues

## 4. Security Analysis
- **Vulnerabilities** - Security weaknesses or unsafe patterns
- **Input Validation** - Data sanitization and validation
- **Secrets Management** - How sensitive data is handled
- **Permissions** - Access controls and privilege escalation risks

## 5. Best Practices Compliance
- **Industry Standards** - Adherence to established practices
- **Language Idioms** - Proper use of language/framework features
- **Documentation** - Quality and completeness of docs
- **Deployment** - Build, distribution, and installation practices

## 6. Critical Issues & Technical Debt
- **Immediate Problems** - Bugs, security issues, broken functionality
- **Technical Debt** - Code that needs refactoring or improvement
- **Missing Features** - Gaps in functionality or tooling
- **Improvement Opportunities** - Concrete suggestions for enhancement

## 7. Honest Assessment Summary
- **Strengths** - What the project does well
- **Weaknesses** - Significant problems or limitations
- **Risk Factors** - Potential issues for users or maintainers
- **Recommendations** - Prioritized actions for improvement

**Instructions for Agent:**
- Be objective and constructive, not harsh
- Support criticisms with specific examples from the code
- Consider the project's stated goals and target audience
- Balance praise with honest critique
- Focus on actionable feedback