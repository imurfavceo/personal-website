# How we work

This is the process for every task in this repo, not just the big ones. Skip a step only when I say so.

Skills are installed (`superpowers:*`, `writing-style`). Where a step names one, invoke it — don't work from memory of it.

## 0. Pull first

**Always start by pulling the latest from the remote** — fetch and rebase/pull onto current `main` — before planning, before reading code, before anything. Plans and reviews built on a stale tree waste the whole run.

If the working tree is dirty, **stop and tell me**. Don't stash, don't discard, don't rebase over it.

## 1. Plan

- **Ask clarifying questions before writing the plan — as many as you need.** Building the wrong thing costs far more than asking. Batch the questions into one round where you can instead of dribbling them out. Use `superpowers:brainstorming` for this.
- **Write the plan to a file**: `docs/plans/YYYY-MM-DD-<slug>.md` (`superpowers:writing-plans`). Subagents get the file path, not a paraphrase of the conversation. Each task in the plan says what to change, how to verify it, and which agent tier runs it (see Models).
- **Review the plan with subagents.** Fresh context, one `reviewer` per angle when the angles differ: does it do what I actually asked, does it fit the existing architecture, what breaks.
- **Do a final review of the plan yourself**, folding in what the reviewers found.
- Show me the plan before you start implementing.

## 2. Implement

- **Subagent-driven development where it makes sense** (`superpowers:subagent-driven-development`): a fresh `implementer` per independent task, plus a `reviewer` after each one.
- Where it doesn't make sense — tightly coupled edits, a one-liner, work that needs the whole conversation in context — **say so and say why, then we decide together**. Don't quietly do it solo, and don't force subagents onto work they'd fumble.
- **Stay in scope.** No drive-by refactors. No new dependencies without flagging it first. No deleting or renaming files the task didn't ask for. If you notice something worth fixing nearby, put it in the report — don't fix it.

## 3. Review

- **Subagent-driven review** of the finished work, one `reviewer` per task.
- Then **a final review yourself** over the whole branch, on the most capable model. If the session isn't on `fable`, spawn a `fable` reviewer for this step.
- Never review with a weaker model than the one that wrote the code.
- Fix what's real. Anything you're deliberately not fixing goes into the PR's action items.

## 4. Verify

Before you say anything works, **run it and paste the output** (`superpowers:verification-before-completion`).

- Run the project's build, tests, and lint. If you don't know the commands, find them; if there are none, say so — don't invent a green checkmark.
- "Should work", "looks right", "I'm confident" are not statuses. Command + output is.
- If a test fails, the report says which one and shows the output. Don't skip it, don't mark it flaky, don't delete it.

## 5. Copy

Every user-facing string goes through this, in order:

1. **The `writing-style` skill** — invoke it, don't work from memory of it.
2. **A nonsense check** — does each sentence say something true and specific? No contradictions, no filler that reads smoothly and means nothing. The `proofreader` agent does this.
3. **A final review** of the copy as a whole.

## 6. Ship

- One branch per task, cut from fresh `main`. Never commit directly to `main`.
- Never force-push. Never rewrite history that's been pushed.
- Commit messages: one line saying what changed and why, not what files were touched.
- PR body, in this order: **Summary** (two sentences) / **What changed** / **How I verified it** (commands + results) / **Action items** (what's deliberately not fixed, and why).
- Use `superpowers:finishing-a-development-branch` to close out.

## Done means

- [ ] Build, tests, lint run — output in the report
- [ ] Every task reviewed, final branch review done
- [ ] Copy pass done on every user-facing string
- [ ] PR open with action items filled in
- [ ] Report sent: what each agent did, what it found, what's unverified

Not all five? Then it's not done — say what's left.

## Exception: feedback batches

When I hand over a written batch of feedback, run the whole process end to end without stopping to check in — including the plan step, and including the code review after the PR is open. Triage those findings: fix the real ones in-branch, put the rest in action items.

## Models

Pick the cheapest model that can **verifiably** do the task; escalate on failure rather than retrying. Agent definitions live in `~/.claude/agents/` (user-level, so every project has them; a project-level `.claude/agents/` overrides). Use them by name so the model and effort are enforced, not suggested.

| Agent | Model / effort | Use for |
|---|---|---|
| Main session | `fable`, xhigh | Planning, decisions, final branch review. If the session is on `opus`, switch with `/model fable` for planning and the final review. |
| `explorer` | haiku, low | Read-only lookups: "where is X", what calls Y, summarize this file. Never edits. |
| `implementer-lite` | sonnet, medium | Only when the plan fully specifies the task AND there's a test or diff to check it against — renames, boilerplate, tests from a spec, copy edits. |
| `implementer` | opus, high | Default for changes. Anything multi-file, any design choice, anything touching schema, auth, payments, or migrations. |
| `reviewer` | opus, xhigh | Plan reviews and per-task reviews. Read-only. |
| `proofreader` | (inherits) | Nonsense check on copy. |

Rules:

- **Escalate, don't retry.** If an agent fails, returns "not sure", or its reviewer rejects twice, re-run one tier up with the failure in the prompt. Same tier twice is wasted quota.
- **Reviewer ≥ implementer.** Always.
- **The main session stays lean.** It coordinates; it doesn't read big files or grind through diffs. That's what `explorer` and the implementers are for.
- Say which model each agent ran on in the report-back.

## Debugging

- Reproduce before you fix. A fix for a bug you haven't seen is a guess.
- One hypothesis at a time. Say what you expect to see before you run the check.
- Three failed fixes means stop: write up what's been ruled out, then escalate — a stronger model, or me. Don't keep swinging.
- Use `superpowers:systematic-debugging` for anything that isn't obvious on first read.

## Hard stops

Ask me first, every time, no matter what the plan says:

- `rm -rf`, deleting branches, deleting files outside the task's scope
- Dropping, resetting, or migrating a database
- Force-push, history rewrites, anything touching `main` directly
- Anything that touches production, sends email or messages, or spends money
- Installing global tools or changing system config

Never print, log, or commit `.env` contents, keys, or tokens. If you see one in a file you're editing, say so and leave it.

## Parallelism

**Run work sessions in parallel by default.** Independent tasks should not queue behind each other, and they should not all burn the main context window.

- The main session is the coordinator. It holds the plan, the decisions, and the review verdicts — not the file-by-file grind.
- Fan out independent work to subagents, one per task, each with its own fresh context. Give each one the plan file path and the task number — enough to work without the conversation.
- Use git worktrees when parallel agents would otherwise edit the same files (`superpowers:using-git-worktrees`).
- Batch the parallel launches into one round rather than starting them one at a time.
- Serialize only what's genuinely coupled: shared schema changes, migrations, anything where two agents would fight over the same lines.

**Parallelism never replaces a quality gate.** Every step in §1–§6 still runs — plan review, per-task review, final branch review, verify, copy pass. Spread them across agents, don't drop them.

### Report format

Every agent reports back in this shape, and so do you:

- **Did**: files changed, one line each
- **Verified**: commands run and what they returned
- **Didn't**: what's unverified or left out, and why
- **Noticed**: out-of-scope things worth a look (not fixed)
- **Model**: which model and effort it ran on

Report what each session did and what it found, not just that it finished.
