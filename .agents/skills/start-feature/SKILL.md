---
name: start-feature
description: Take a new feature idea through interactive clarification, a concise local specification, spec review, and delegated implementation with independent validation. Use when the user asks to start a feature with this complete workflow. For an already approved spec, use implement-spec directly; discussion-only requests do not authorize implementation.
---

# Start a feature

Coordinate one feature from idea to verified implementation in the main conversation. Run the stages in order; later stages depend on the user's decisions and the earlier results. Loading this skill does not supply those decisions.

Example: `Use $start-feature. I want to add a history of shortened links.`

## Dependencies and ownership

This workflow composes three installed skills. Resolve these sibling paths relative to this file, and load each skill when its stage begins:

- [grilling](../grilling/SKILL.md) for clarifying the idea. Call it directly; the `grill-me` entry-point wrapper is not required.
- [to-spec](../to-spec/SKILL.md) for synthesizing the agreed decisions.
- [implement-spec](../implement-spec/SKILL.md) for planning, implementation, corrections, and independent validation.
- [hexagonal-architecture](../hexagonal-architecture/SKILL.md) for architectural guidance for the backend implementation.

Check that the files exist before starting. If a dependency is missing, look for the same skill in the configured skill locations; if it remains unavailable, report the missing dependency and stop the affected workflow rather than silently replacing or installing it.

The main agent owns the conversation and the transitions. Follow applicable repository instructions and runtime permissions. Read the repository state and preserve existing work. Reuse factual exploration across stages. Keep the feature's goal, decisions, exclusions, spec path, and current stage available for handoffs and resumption, using repository tracking rules where applicable.

## 1. Clarify the idea

Read the user's feature idea and existing conversation first. If no idea was supplied, ask for it. If the user already supplied an approved spec and authorized implementation, hand off directly to `implement-spec` instead of repeating clarification.

Load `grilling`. For this workflow, apply it with these parameters:

- Ask one meaningful unresolved question at a time, with a recommendation where useful, and wait for the answer.
- Focus on the goal, scope, observable behavior, constraints, and acceptance criteria. Do not expand the feature to unrelated improvements or repeat settled questions.
- Use source inspection and the skill's read-only exploration delegates for facts the agent can discover. Ask the user for product decisions, not repository facts.
- Discuss how the feature's observable behavior will be verified using existing interfaces and test facilities. Confirm consequential testing choices here so spec drafting need not repeat the interview.

Remain read-only during clarification. Once the important decisions are settled, summarize the agreed understanding and obtain the confirmation required by `grilling`. Confirmation of the idea permits drafting its spec within this workflow; it is not approval to implement an unseen spec.

## 2. Write a concise local spec

Load `to-spec` and give it the agreed decisions and relevant code evidence. Use the following workflow-specific instructions, which replace its default tracker destination and extensive template:

> Synthesize the confirmed discussion into a concise local Markdown specification. Use Goal, Scope, Requirements, and Acceptance criteria. Include implementation or testing decisions only when needed to preserve an agreed constraint. Do not invent features or require an extensive user-story list. Save to the selected local spec path. Do not publish an issue, apply triage labels, or run issue-tracker setup. Do not implement application changes.

Use the user's requested path or `specs/<descriptive-feature-name>.md`. Preserve any repository-mandated spec format. If the target already exists, inspect it and reuse it only when it is the same feature; do not overwrite unrelated work.

Express acceptance criteria as observable outcomes and keep exclusions explicit. If synthesis exposes a consequential unresolved decision, return that question to clarification rather than filling the gap with an assumption. Only the feature specification may be written at this stage.

## 3. Review and agree on the spec

Compare the written spec with the agreed decisions and existing code. Look for contradictions, omitted outcomes, accidental scope expansion, and verification gaps. Use the evidence already collected and bounded read-only exploration where more facts are necessary.

Discuss material findings one at a time. Apply agreed corrections to the same spec; preserve settled requirements. Do not turn pre-existing defects into new requirements without the user's instruction.

Present the concrete spec link and a short scope summary. If this exact spec has not already been approved for implementation, ask whether it is ready to implement and wait. Explain that this is the handoff from requirements to application changes. Do not treat silence or an answer to an earlier design question as implementation approval. If the user wants only a spec, finish here.

## 4. Implement and validate

Once the user approves implementation of the spec, load `implement-spec` and pass the spec path, user corrections, relevant evidence, and existing-work context to it. This is an in-session handoff of instructions, not a shell command.

Let `implement-spec` own its sequence: planning subagent with CortexDB context, new implementation subagent, fresh independent validation subagent, and bounded corrections when required. Do not duplicate that machinery here or skip its planning/validation stages because discovery was done earlier.

Continue authorized handoffs without asking the user to approve each subagent. Surface real scope decisions, required permissions, or missing verification capabilities under the existing workflow's rules. Do not silently rewrite the approved spec to make a failing implementation pass.

Finish with the spec location, implementation outcome, observed checks, and any unresolved or unverified requirements. Follow existing authorization for commits and delivery; this workflow adds no publishing permission.
