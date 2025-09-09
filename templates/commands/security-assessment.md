---
description: Comprehensive security evaluation workflow combining code analysis, dependency scanning, and review
argument-hint: "[quick|standard|deep]"
allowed-tools: Task, Read
plan_mode: true
---

# Intent

Perform comprehensive security assessment by orchestrating multiple specialized subagents to deliver complete security coverage. This meta-command chains security auditing, dependency analysis, and code review to identify vulnerabilities across all attack surfaces.

# Procedure

This command implements a **3-phase security workflow** that combines:

1. **Infrastructure & Code Security Analysis** → cm-security-auditor subagent
2. **Dependency Security Scanning** → cm-dependency-manager subagent  
3. **Security-Focused Code Review** → cm-reviewer subagent

The workflow adapts based on the assessment mode argument:
- **quick**: Critical vulnerabilities and high-risk dependencies
- **standard** (default): Comprehensive security analysis with remediation plan
- **deep**: Exhaustive security evaluation with threat modeling

# Execution

When this command runs, Claude Code will:

## Phase 1: Infrastructure & Code Security Analysis

Use Task tool to invoke the cm-security-auditor subagent:
- **subagent_type**: "cm-security-auditor"
- **description**: "Comprehensive security audit for security assessment"
- **prompt**: 
  ```
  Perform comprehensive security analysis as part of multi-phase security assessment.
  Focus on code vulnerabilities, infrastructure security, and architectural issues.
  Mode: [quick|standard|deep based on $ARGUMENTS]
  
  Priority areas:
  - Code-level vulnerabilities (injection, XSS, authentication flaws)
  - Infrastructure security (Docker, K8s, CI/CD, cloud config)
  - Configuration security (secrets, permissions, network security)
  - Architecture security (trust boundaries, data flow, access control)
  
  This is phase 1 of 3 - dependency analysis and code review will follow.
  Format findings for integration with dependency and review analysis.
  ```

## Phase 2: Dependency Security Scanning

Use Task tool to invoke the cm-dependency-manager subagent:
- **subagent_type**: "cm-dependency-manager"
- **description**: "Dependency security analysis for security assessment"
- **prompt**:
  ```
  Perform dependency security analysis as part of multi-phase security assessment.
  Focus on vulnerabilities, supply chain risks, and compliance issues.
  Mode: [quick|standard|deep based on $ARGUMENTS]
  
  Priority analysis:
  - High-severity CVEs with active exploits
  - Supply chain risks and malicious packages
  - Unmaintained dependencies with security issues
  - License compliance and policy violations
  - Transitive dependency vulnerabilities
  
  This is phase 2 of 3 - building on infrastructure analysis, code review follows.
  Coordinate findings with infrastructure security analysis from phase 1.
  ```

## Phase 3: Security-Focused Code Review

Use Task tool to invoke the cm-reviewer subagent:
- **subagent_type**: "cm-reviewer"  
- **description**: "Security-focused code review for security assessment"
- **prompt**:
  ```
  Perform security-focused code review as part of comprehensive security assessment.
  Synthesize findings from infrastructure analysis and dependency scanning.
  Mode: [quick|standard|deep based on $ARGUMENTS]
  
  Focus areas:
  - Code patterns that introduce security vulnerabilities
  - Implementation of security controls and mitigations
  - Integration points with flagged dependencies
  - Security implications of architectural decisions
  - Validation of security best practices in implementation
  
  This is the final phase - provide integrated security assessment with:
  - Critical vulnerabilities requiring immediate action
  - Security improvement recommendations
  - Remediation priority and implementation guidance
  
  Synthesize insights from all 3 phases into comprehensive security posture.
  ```

## Workflow Integration

The three-phase approach provides:

1. **Attack Surface Analysis**: Infrastructure and code vulnerabilities
2. **Supply Chain Security**: Dependency risks and compliance issues  
3. **Implementation Review**: Code-level security patterns and controls

Each phase builds context for the next, creating a comprehensive security evaluation that covers all major attack vectors and provides actionable remediation guidance.

## Assessment Modes

### Quick Mode
- Critical infrastructure vulnerabilities and high-risk code patterns
- High-severity CVEs with active exploits
- Immediate security actions required for production safety

### Standard Mode (Default)
- Comprehensive security analysis across all attack surfaces
- Complete dependency vulnerability and compliance assessment
- Detailed remediation plan with priority ranking

### Deep Mode  
- Exhaustive security evaluation with threat modeling
- Supply chain risk analysis with vendor assessment
- Advanced security architecture review with improvement roadmap

The security assessment workflow scales from "fix critical issues now" to "comprehensive security strategy" based on the selected analysis depth.

## Security Coverage Areas

This workflow provides comprehensive coverage across:

**Application Security:**
- Code injection vulnerabilities (SQL, XSS, Command, etc.)
- Authentication and authorization flaws
- Input validation and sanitization issues
- Cryptographic implementation problems

**Infrastructure Security:**
- Container and orchestration security
- Cloud configuration and IAM issues
- CI/CD pipeline security weaknesses
- Network security and exposure risks

**Supply Chain Security:**
- Dependency vulnerabilities and exploits
- Malicious package detection
- Supply chain attack vectors
- License compliance and legal risks

**Operational Security:**
- Secrets management and exposure
- Logging and monitoring coverage
- Incident response preparedness
- Security maintenance processes

## Best Practices

This meta-command demonstrates **security workflow orchestration**:
- Multi-layered security analysis with specialized expertise
- Context sharing between security domains
- Risk-based prioritization across attack surfaces
- Integrated remediation planning with effort estimation

Each subagent receives context about its role in comprehensive security assessment to ensure thorough coverage without duplication of effort.