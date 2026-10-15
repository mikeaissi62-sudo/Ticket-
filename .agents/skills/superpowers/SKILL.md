---
name: superpowers
description: Software development superpowers workflow framework for AI coding agents. Enforces test-driven verification, systematic step-by-step planning, resilient error recovery, edge-case anticipation, and clean atomic commits.
---

# Superpowers Workflow Skill

## Overview
The `superpowers` skill equips the agent with disciplined engineering execution patterns to build reliable, maintainable, and robust software with minimal human supervision.

## Core Superpowers Principles

### 1. Systematic Investigation First
- Never guess code behavior or API signatures.
- Always inspect active code, schemas, and configurations prior to modifications.
- Reproduce bugs before proposing or writing fixes.

### 2. Surgical and Atomic Progression
- Break large tasks into distinct, verifiable increments.
- Implement one atomic unit at a time (e.g., model -> service -> endpoint -> UI).
- Test each increment immediately after implementation.

### 3. Verification & Self-Healing
- Always verify changes with type checking (`tsc --noEmit` or equivalent linter).
- Run automated tests or execute scratch scripts to validate edge cases.
- If a step fails, diagnose root cause using logs before attempting fixes; do not make random mutations.

### 4. Resilient Fallbacks
- For third-party services (APIs, databases, external models, cache): always implement graceful degradation or fallback mechanisms so the application remains operable even when downstream services experience outages or rate limits.

### 5. Git Hygiene
- Stage only relevant changed files.
- Use Conventional Commits (`feat:`, `fix:`, `refactor:`, `perf:`, `chore:`).
- Keep commit messages concise, descriptive, and aligned with user expectations.
