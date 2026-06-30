"""
Agent 7 – Interview Question Generator
"""
from __future__ import annotations

from typing import Any, Dict, List

from agents.base_agent import BaseAgent
from config import settings
from models.agents import InterviewQuestion, InterviewResult


class InterviewAgent(BaseAgent):
    agent_id   = "interview"
    agent_name = "Interview Generator"

    async def run(self, context: Dict[str, Any]) -> Dict:
        frameworks = context["frameworks"]
        languages  = context["languages"]

        if settings.MOCK_AI:
            result = _mock_result(languages, frameworks)
        else:
            summary = context["summary"]
            prompt = (
                f"Generate interview questions for a developer who built this repository.\n"
                f"Tech stack: {', '.join(languages + frameworks)}\n"
                f"Context: {summary}\n\n"
                "Generate 5 questions each for: beginner, intermediate, advanced, system_design.\n"
                "Return as JSON array with fields: level, topic, question, hint."
            )
            raw = await self.llm(prompt)
            result = _parse_result(raw)

        return result.model_dump()


def _mock_result(languages: List[str], frameworks: List[str]) -> InterviewResult:
    tech = (languages + frameworks)[:3]
    primary = tech[0] if tech else "Python"

    questions = [
        # Beginner
        InterviewQuestion(level="beginner", topic="Web Fundamentals",
            question="What is the difference between GET and POST HTTP methods?",
            hint="Think about data visibility and use cases for each."),
        InterviewQuestion(level="beginner", topic="REST API",
            question="What does REST stand for, and what are its key constraints?",
            hint="Stateless, Client-Server, Cacheable, Uniform Interface..."),
        InterviewQuestion(level="beginner", topic=primary,
            question=f"What are the main advantages of using {primary} for backend development?",
            hint="Think about performance, ecosystem, and developer experience."),
        InterviewQuestion(level="beginner", topic="Version Control",
            question="What is the difference between git merge and git rebase?",
            hint="Consider history linearity and conflict resolution."),
        InterviewQuestion(level="beginner", topic="Async Programming",
            question="What is the difference between synchronous and asynchronous code?",
            hint="Think about blocking vs non-blocking I/O."),

        # Intermediate
        InterviewQuestion(level="intermediate", topic="Authentication",
            question="Explain how JWT authentication works end-to-end, from login to protected resource access.",
            hint="Cover: signing, payload, expiry, validation on each request."),
        InterviewQuestion(level="intermediate", topic="Database",
            question="What is the N+1 query problem and how do you solve it?",
            hint="Think about eager loading, JOIN queries, and batch fetching."),
        InterviewQuestion(level="intermediate", topic="React",
            question="When would you use useCallback vs useMemo in React?",
            hint="Consider function identity, expensive computations, and dependency arrays."),
        InterviewQuestion(level="intermediate", topic="API Design",
            question="How would you design pagination for a large dataset API?",
            hint="Compare cursor-based vs offset pagination. Consider performance implications."),
        InterviewQuestion(level="intermediate", topic="Error Handling",
            question="How do you implement global error handling in FastAPI?",
            hint="Look at exception handlers, HTTPException, and middleware."),

        # Advanced
        InterviewQuestion(level="advanced", topic="System Architecture",
            question="How would you refactor this application to use a microservices architecture? What are the trade-offs?",
            hint="Consider service boundaries, data consistency, network overhead, and operational complexity."),
        InterviewQuestion(level="advanced", topic="Performance",
            question="The repository analysis endpoint is slow under load. Walk me through how you'd diagnose and fix it.",
            hint="Profiling, caching, async I/O, database optimization, horizontal scaling."),
        InterviewQuestion(level="advanced", topic="AI/ML",
            question="How does RAG (Retrieval Augmented Generation) work, and how is it used in this project?",
            hint="Embedding, vector search, context injection into LLM prompt."),
        InterviewQuestion(level="advanced", topic="Security",
            question="What security measures would you implement before deploying this to production?",
            hint="Authentication, rate limiting, HTTPS, secrets management, SAST scanning."),
        InterviewQuestion(level="advanced", topic="Testing",
            question="Design a comprehensive testing strategy for the 8-agent analysis pipeline.",
            hint="Unit tests per agent, integration tests, mocking LLM, end-to-end tests."),

        # System Design
        InterviewQuestion(level="system_design", topic="Scalability",
            question="Design a system that can handle 10,000 concurrent repository analyses. What changes would you make?",
            hint="Message queues, worker pools, distributed caching, CDN, horizontal scaling."),
        InterviewQuestion(level="system_design", topic="Caching",
            question="Design a multi-level caching strategy for the analysis results.",
            hint="L1: in-memory, L2: Redis, L3: database. Consider TTL, invalidation, cache keys."),
        InterviewQuestion(level="system_design", topic="Reliability",
            question="How would you make the agent pipeline fault-tolerant? What happens when one agent fails?",
            hint="Retry logic, circuit breakers, partial results, dead letter queues."),

        # Coding
        InterviewQuestion(level="coding", topic="Python",
            question="Write an async function that reads multiple files concurrently using asyncio.gather().",
            hint="Use asyncio.gather() with a list of coroutines for concurrent I/O."),
        InterviewQuestion(level="coding", topic="TypeScript",
            question="Implement a custom React hook usePolling(url, interval) that polls an API endpoint.",
            hint="Use useEffect, setInterval, useState, and cleanup with clearInterval."),
    ]

    by_level: Dict[str, List] = {}
    for q in questions:
        by_level.setdefault(q.level, []).append(q.model_dump())

    return InterviewResult(
        questions=questions,
        total=len(questions),
        by_level=by_level,
        focus_areas=list(set(q.topic for q in questions[:8])),
    )


def _parse_result(raw: str) -> InterviewResult:
    q = InterviewQuestion(level="beginner", topic="General", question=raw[:200])
    return InterviewResult(questions=[q], total=1, by_level={"beginner": [q.model_dump()]}, focus_areas=["General"])
