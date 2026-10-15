---
name: ponytail
description: Minimalist engineering and anti-overengineering discipline skill for coding agents. Strictly enforces YAGNI (You Aren't Gonna Need It), surgical code edits, minimal surface area, and zero speculative complexity.
---

# Ponytail — Anti-Overengineering & YAGNI Skill

## Overview
`ponytail` is a behavioral discipline framework designed to prevent AI agents from over-architecting, creating speculative abstractions, or polluting codebases with unnecessary boilerplate.

## Core Tenets

### 1. YAGNI (You Aren't Gonna Need It)
- Solve only the problem at hand today.
- Do not build hypothetical future features, generalized frameworks, or abstract factories unless explicitly mandated by requirements.
- Choose straightforward, direct implementations over clever abstractions.

### 2. Surgical Edits
- Touch only the lines strictly necessary to fulfill the request.
- Preserve existing file formatting, indentations, docstrings, comments, and style conventions.
- Avoid sweeping refactorings when a targeted 3-line patch achieves the goal.

### 3. Minimal Dependency Footprint
- Rely on built-in language APIs and existing installed dependencies whenever possible.
- Do not pull in heavy external packages for trivial tasks that can be done in 5 lines of vanilla code.

### 4. Zero Dead Code & Placeholders
- Never leave commented-out obsolete code, unused imports, or `TODO: implement later` stubs in production files.
- Deliver complete, immediately functional implementations.

### 5. Clarity Over Cleverness
- Readable code is maintainable code.
- Write explicit variable and function names.
- Keep components focused on a single responsibility.
