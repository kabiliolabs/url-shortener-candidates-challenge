# Submission

## What I Did

I took a vertical slice approach, building a solid end-to-end feature set while keeping the hours constraint in mind. Since my main strength is frontend, I focused heavily on UI quality, component architecture, and user experience, while keeping the backend implementation clean but minimal.

On the frontend, I improved consistency across the UI, extracted reusable patterns like the clipboard hook and components (CopyButton, StatsCard, URLCard), and added meaningful accessibility improvements (aria-live regions, proper loading states, keyboard navigation). I prioritized form UX—proper disabled states, error feedback, and visual loading indicators—because these are the details that make a product feel polished. I also wrote focused tests for high-value interactions rather than chasing coverage metrics.

The backend implementation is straightforward but solid: Prisma with SQLite for persistence, collision-resistant short code generation, input validation, and click tracking. I intentionally avoided overengineering here—no elaborate clean architecture, no complex abstractions. The goal was to demonstrate good fundamentals (validation, data modeling, basic service layer) without spending the limited time on patterns that would be premature for this scope.

## What I Would Do With More Time

- Expand test coverage for edge cases and error states (network failures, validation edge cases) and implement the Backend Tests.
- Add a lightweight design system layer (shared theme tokens, consistent spacing scale)
- Implement rate limiting on URL creation to prevent abuse
- Add structured logging and basic observability (error tracking, performance metrics) - something like sentry or grafana
- Add URL expiration and optional custom slugs for power users
- Implement basic analytics dashboard (most clicked links, creation trends)

## AI Usage

I used AI as a pair programming reviewer (Cursor) and thinking partner (gpt-5.2), not as an autopilot. I worked incrementally—making small changes, asking for explanations before implementing suggestions, and validating ideas against the time constraint and actual requirements. The goal was to move faster on boilerplate and get quick feedback on patterns, while maintaining full control over architectural decisions.

Example prompts I used:

- "I want to extract the clipboard logic into a reusable hook. Show me the pattern and explain the tradeoffs."
- "Review this form component. Are there UX improvements I'm missing? Focus on loading states and error feedback."
- "Help me write a test for the CopyButton component. What are the most valuable assertions to include?"

I avoided asking for full rewrites or letting AI make architectural decisions. Instead, I used it to validate my thinking, catch edge cases I might have missed, and speed up repetitive tasks like test setup and component extraction.

## Feedback

The challenge was well-scoped and realistic. The 2 hour constraint forced good prioritization decisions, and the combination of frontend + backend work allowed me to demonstrate both UI craft and systems thinking without going too deep in either direction.

The requirements were clear, though it might be helpful to explicitly mention documentation expectations upfront for time-limited challenges—I wasn't sure if I should prioritize inline comments, a detailed README, or just clean, self-documenting code. I defaulted to the latter.

Overall, this felt like a fair assessment that mirrors real-world product work: build something functional and polished within a constraint, make deliberate tradeoffs, and communicate your thinking clearly.
