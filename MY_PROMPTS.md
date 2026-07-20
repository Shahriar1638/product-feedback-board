# MY_PROMPTS.md — Prompts Used During Development

A chronological log of all prompts used across AI agents during the development of this project. Organized by session for traceability.

---

## Session 1 — MIMO v2.5 (Initial Build)

### Phase 0: Project Setup
1. *"i have just set up next with tailwind eslint src as code directory and app router . now install zod , mongoose"*
2. *"just read : 'f:\Job Projects\product-feedback-board\AGENTS.md''f:\Job Projects\product-feedback-board\CLAUDE.md''f:\Job Projects\product-feedback-board\SPEC.md'. and tell me things that is left to install."*
3. *"Yes pls"*
4. *"read : 'f:\Job Projects\product-feedback-board\DESIGN.md' and define 'f:\Job Projects\product-feedback-board\src\app\globals.css' and the tailwind config ts. i have added uri in : 'f:\Job Projects\product-feedback-board\.env'. after that create the schema and indexes as mentioned in : 'f:\Job Projects\product-feedback-board\SPEC.md'"*
5. *"install gsap and motion. and wait for my command"*
6. *"read : 'f:\Job Projects\product-feedback-board\AGENTS.md' and make sure follow the command mentioned there."*
7. *"adjust spec.md then. so that we dont face any logic conflict"*
8. *"now before we proceed with phase 2 and further , check phase 0 & 1 cross check with the best practice mentioned in 'f:\Job Projects\product-feedback-board\AGENTS.md'."*

### DNS / MongoDB Connection Fix
9. *"search web and also check `node_modules/next/dist/docs/` to fix the issue :"* [followed by seed script error — MongooseServerSelectionError due to DNS]

10. *"i have added that to my ip as u can see in the image btw in online i got a solution like..."* [DNS fix via `dns.setServers(["1.1.1.1", "1.0.0.1"])`]

11. *"verify if the seed is success now :"* [confirmed seed ran successfully — 30 feedback docs, 85 vote trackers, all indexes verified]

### Phases 2–10: Implementation
12. *"proceed with phase 2"* — Zod validation schemas, sanitize, identifier, rate-limit, proxy
13. *"proceed (phase 3)"* — Server actions, route handlers, 503 error handling
14. *"now phase 4 & 5"* — UI primitives, FeedbackCard, FeedbackGrid, FeedbackForm, page wiring
15. *"now phase 6"* — Filter/sort/search, debounce, URL state, query routing
16. *"now revise phase 2-6. from : 'f:\Job Projects\product-feedback-board\TASKS.md'."*
17. *"now phase 7,8,&9"* — Optimistic voting, delete flow, error/not-found boundaries, security hardening
18. *"now phase 10"* — Polish: a11y, fonts, responsive QA, README, build
19. *"export our chat log."*

---

## Session 2 — Gemini 3.5 Flash (Audit)

1. *"read : 'f:\Job Projects\product-feedback-board\DESIGN.md''f:\Job Projects\product-feedback-board\SPEC.md''f:\Job Projects\product-feedback-board\AGENTS.md' and wait for my commands"*
2. *"ok now read : 'f:\Job Projects\product-feedback-board\TASKS.md' and verify if i have implemented everything correctly"*

---

## Session 3 — DeepSeek V4 Flash Max & This Session (Bug Fixes, Features, Polish)

1. *"Proceed fixing critical issues"* — Fixed `voteCount` bugs (downvotes, switch), missing `crypto` import, dead un-vote code path
2. *"ok now do a minor change in feature, count up vote and down vote separately [...] adjust the schema accordingly also update the existing feedback cards on mongo accordingly . if any task or spec md file mentions that we need to count them together then update them too."* — Changed UI from net count to separate upvote/downvote displays
3. *"read : 'f:\Job Projects\product-feedback-board\DESIGN.md''f:\Job Projects\product-feedback-board\SPEC.md''f:\Job Projects\product-feedback-board\AGENTS.md' and wait for my commands"* — Started comprehensive review
4. *"ok now read : 'f:\Job Projects\product-feedback-board\TASKS.md' and verify if i have implemented everything correctly"* — Full audit against checklist
5. *"continue [because of the network issue i stopped u at the middle of ur task]"* — Resumed interrupted audit
6. *"yes pls"* — Implemented all gaps: toast system, SlideOver panel, React Hook Form, GSAP/Motion animations, mongo-sanitize, IP hash fallback
7. *"ok now lets do a revise regarding features : read 'f:\Job Projects\product-feedback-board\AGENTS.md' , 'f:\Job Projects\product-feedback-board\SPEC.md''f:\Job Projects\product-feedback-board\TASKS.md'. and check if everything is implemented correctly or no ."* — Final comprehensive cross-check
8. *"what should be my commit message ?? with fix we have done"*
9. *"minor fix needed card height has some miss match so can u use '...' with a see more button that will un fold and show rest of the texts and the card will come at center as a pop up modal ??"* — Added description truncation + detail modal
10. *"remember that i previously told u [...]"* — Refined the truncation implementation
11. *"put the see more after the '...' (eg. lorem ipsum....see more) and truncate to string size 125. also use some fixed height for the description portion as one line descriptions can break the height symmetric."* — String-based truncation + fixed-height container
12. *"'f:\Job Projects\product-feedback-board\AGENTS.md' do a cross check with the file to see if any issue exist ."* — Next.js 16 breaking changes audit
13. *[Hydration mismatch error log]* — Fixed GSAP `useLayoutEffect` vs hydration conflict via deferred `ready` state
14. *"btw can u organize this file : 'f:\Job Projects\product-feedback-board\MY_PROMPTS.md' also add my latest prompts as well as the company wanna know how i used it . some prompts may sound unfamiliar to u as those where used on another session for this same project"* — This file
