---
name: implement-spec
description: Implement an agreed specification through a planning subagent, a separate implementation subagent, and independent validation. Use when the user requests implementation from a spec or asks for this delegated workflow; do not start implementation for spec drafting, discussion, or review-only requests.
---

# Implement a specification

Turn an agreed specification into verified changes. The main agent owns the sequence and every handoff: read the spec, delegate planning, launch a new implementer, then launch a new validator. Workers return results to the main agent and do not spawn additional agents.

Example request: `Use $implement-spec for specs/my-feature.md`.

## 1. Establish the scope

- Read the complete spec and the user's latest corrections. Confirm that implementation is authorized; resolve consequential missing requirements before dependent work.
- Read applicable repository instructions and inspect Git status. Record the baseline commit and any existing changes so validation can distinguish this task's changes from prior work.
- Check that subagent tools are available. If delegation is unavailable, report the limitation instead of claiming this workflow ran or silently replacing it with inline implementation.
- Resolve relevant installed skill paths for the workers. Follow repository rules for tracking, tests, review, models, and delivery without duplicating those workflows here. Keep small work resumable from the spec, task checklist, and diff; use durable tracking when repository rules require it.

Proceed through authorized phases without asking the user to approve each handoff. Pause for a real scope decision, required permission, or unavailable proof needed for completion.

## 2. Delegate planning

Launch a read-only planning subagent with the spec path, repository root, user corrections, baseline, and relevant skill paths. Require it to read the original spec and those skills before planning.

The planner retrieves relevant CortexDB context using the available `knowledge_memory_recall` tool, scoped according to repository memory instructions. It checks recalled facts against current files. The spec establishes intended behavior; code establishes implemented behavior. Memory never overrides either. If CortexDB is unavailable or returns no useful evidence, report that and continue from the spec and code when safe. Inspect the graph schema before relationship queries; co-occurrence is not dependency evidence.

The planner returns a concise handoff containing:

- Tasks with stable IDs and references to the spec sections or acceptance criteria they cover.
- Required changes and exact affected paths, with source references.
- Existing helpers to reuse and behavior, data, or interfaces to preserve.
- Verification commands and observable checks appropriate to the project, including any required baseline comparison.
- Open decisions, relevant existing failures, and unavailable tooling or proof.

The main agent waits for the completed handoff, checks it against the spec, and resolves blockers before implementation. A plan cannot authorize features outside the spec.

## 3. Delegate implementation

Launch a new implementation subagent with the original spec, the planner's handoff, task IDs, relevant skill paths, and exact verification commands. Include an `## Allowed edit surfaces` section containing only repository-relative file paths or narrow globs, plus authorized locations for new files. Explicitly identify pre-existing untracked files it may edit. The main agent derives these boundaries; do not leave them for the worker to guess.

Require the implementer to:

- Read the spec and plan, complete the assigned tasks within those boundaries, and reuse the identified helpers.
- Preserve unrelated work and avoid fixing existing functional issues outside the requested scope.
- Follow the project's applicable test-first policy. When no meaningful runnable RED check exists, state the reason and use proportionate checks rather than inventing test evidence.
- Run the agreed checks after final source normalization and report observed results.
- Return task coverage, changed files, verification results, remaining gaps, and any temporary artifacts or processes needing cleanup.

The main agent waits for completion and inspects the diff against the allowed surfaces. Keep Git operations under the main agent's control and follow existing delivery authorization; invoking this skill does not itself authorize committing, pushing, publishing, or deployment.

## 4. Delegate independent validation

Launch a new validation subagent after implementation is complete. Give it the original spec, task checklist, baseline and existing-change context, actual candidate changes, relevant skills, and verification commands. The implementer's summary is context, not proof.

The validator reads the spec and candidate independently. It does not edit application files or repair findings. Run mutating probes in isolated temporary state; use browser checks for visual requirements and behavioral tests for functionality when applicable. Compare against the baseline when needed to establish causality. Label synthetic fixtures and static checks accurately rather than presenting them as executed application paths.

Require a verdict for each task and acceptance criterion:

- **Pass:** observed evidence supports completion.
- **Fail:** a reproducible implementation mismatch or change-caused regression, with reproduction details and affected paths.
- **Unverified:** required evidence is unavailable or a check was not run, with the reason.

Report existing defects and optional improvements separately. Neither expands implementation scope. Return commands and observed outcomes, temporary artifact locations, and process-cleanup status. A successful build alone does not prove visual or behavioral requirements.

## 5. Correct and close

The main agent reviews the validator's evidence. Send confirmed in-scope failures together to the same implementation agent, then ask the validator to recheck those failures and any directly affected checks. Keep the accepted spec fixed; a scope change requires the user's decision.

Follow repository correction limits. If none are specified, allow one correction batch and targeted recheck; allow a second batch only if an original blocker still reproduces. If blockers remain or necessary proof is unavailable, report the unresolved requirement and exact decision or capability needed. Do not loop indefinitely or label partial validation as complete.

Before completion, inspect the final diff and perform the repository-required parent spot check. Stop task-owned processes and clean up temporary scratch state after inspecting its evidence. Save significant verified decisions and implementation facts to CortexDB according to repository memory rules, preserving valid existing knowledge and verifying writes. Memory unavailability does not turn completed code into a failure, but must not be reported as successful persistence.

Report what changed, which requirements were verified, all failed or unverified checks, and whether changes were committed under existing authorization. Keep implementation claims separate from any unavailable native review machinery. The main agent returns one consolidated outcome to the user.
