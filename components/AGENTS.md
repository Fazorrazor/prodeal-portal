<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

<!-- BEGIN:ui-foresight-rule -->
# SYSTEMIC UI FORESIGHT

Treat every interface request as a change to an interconnected product
system, not as an isolated screen edit.

## Core obligation

Before implementation, identify the underlying user goal and determine the
smallest coherent change that solves it without weakening related journeys,
states, components, or user expectations.

Do not begin by styling or editing the named component. First inspect the
surrounding experience and the existing implementation.

## Change classification

Classify the request as:

- Local: an isolated visual or content adjustment
- Shared: a change to a reusable component or repeated pattern
- Journey-level: a change affecting multiple steps in a user task
- Systemic: a change affecting navigation, terminology, permissions,
  data models, or foundational interaction behaviour

Apply analysis, implementation, and validation proportional to the
classified blast radius. Do not overengineer local changes, and do not
underanalyse systemic ones.

## Before implementation

Briefly establish:

1. The underlying user goal.
2. The affected journeys, screens, components, roles, permissions,
   data flows, states, and downstream behaviours.
3. The existing components, tokens, patterns, utilities, and tests that
   should be reused or extended.
4. The primary risks, failure modes, second-order effects, and recovery
   requirements.
5. The smallest coherent solution and any necessary consistency updates.

Inspect the repository before creating new UI primitives or interaction
patterns. Reuse established design-system components and product
conventions wherever they adequately solve the problem.

## Experience completeness

Where relevant, account for:

- Initial, loading, empty, partial, success, error, offline, denied,
  interrupted, stale, duplicate, and recovery states
- First-time, returning, and expert users
- Different roles, permissions, account states, and ownership conditions
- Mobile, tablet, desktop, touch, mouse, keyboard, and assistive technology
- Focus order, focus restoration, semantic structure, accessible names,
  contrast, reduced motion, and screen-reader feedback
- Short, long, missing, translated, and user-generated content
- Slow networks, weak devices, delayed responses, retries, duplicate
  submissions, and concurrent changes
- Privacy, security, destructive consequences, and user trust

Not every change requires a new interface for every state. However, the
behaviour of each relevant state must be deliberate rather than accidental.

## Consistency requirements

Check and preserve:

- Visual consistency: tokens, typography, spacing, colour, iconography,
  emphasis, and component variants
- Behavioural consistency: validation, navigation, menus, forms,
  confirmations, feedback, cancellation, and recovery
- Linguistic consistency: terminology, labels, instructions, and action
  wording
- Structural consistency: information hierarchy, action placement,
  navigation, and responsive organisation

If a new pattern is genuinely necessary, define its reusable behaviour and
apply it to all directly affected instances.

## Risk and safeguards

Match safeguards to:

- The likelihood of user error
- The severity of the consequence
- The reversibility of the action
- The user's ability to understand what will happen

Prefer low-friction feedback for safe actions, undo for recoverable actions,
clear confirmation for consequential actions, and stronger verification
for irreversible or security-sensitive actions.

## Scope discipline

Systemic awareness does not grant permission for an unrelated rewrite.

Separate findings into:

- Required changes
- Necessary consistency updates
- Optional future improvements

Implement required changes and necessary consistency updates only. Report
optional improvements without expanding scope unless they are explicitly
requested.

Preserve existing behaviour, data compatibility, URLs, accessibility,
analytics hooks, and public component contracts unless changing them is
necessary for the requested outcome.

Do not silently alter unrelated behaviour.

## Conflict resolution

When goals conflict, prioritise:

1. Prevention of serious harm, data loss, and security failure
2. Accessibility, privacy, and user trust
3. Completion of the user's core task
4. Clarity and predictable behaviour
5. Prevention and recovery from mistakes
6. Cross-product consistency
7. Efficiency and reduced effort
8. Visual polish and delight

If the literal request would create inconsistency, accessibility problems,
or systemic risk, do not blindly implement it. Adapt the solution, briefly
explain the trade-off, and implement the smallest coherent alternative that
satisfies the underlying user goal.

## Validation

Before declaring completion, verify the relevant parts of the following:

- The primary journey works from entry to completion
- Loading, failure, cancellation, retry, and recovery behave deliberately
- Role and permission restrictions are enforced and communicated
- Keyboard navigation and focus behaviour work correctly
- Screen-reader semantics and feedback are meaningful
- Responsive layouts remain usable at supported sizes
- Long and variable content does not break the interface
- Related existing journeys have not regressed
- Shared components remain compatible
- Relevant tests, type checks, linting, and builds pass
- No new runtime errors, console errors, or hydration problems are introduced

A feature is complete only when its full journey, relevant edge cases,
feedback, recovery, responsive behaviour, accessibility, and system-wide
impact have been addressed.

When reporting completion, summarise:

- What changed
- What related surfaces were checked or updated
- What states and risks were handled
- What validation was performed
- Any remaining assumptions, exclusions, or optional improvements
<!-- END:ui-foresight-rule -->
