# Prompts that I used in CLI AI AGENT

1. i have just set up next with tailwind eslint src as code directory and app router . now install zod , mongoose 
2. just read : "f:\Job Projects\product-feedback-board\AGENTS.md""f:\Job Projects\product-feedback-board\CLAUDE.md""f:\Job Projects\product-feedback-board\SPEC.md". and tell me things that is left to install.
3. Yes pls
4. read : "f:\Job Projects\product-feedback-board\DESIGN.md" and define "f:\Job Projects\product-feedback-board\src\app\globals.css" and the tailwind config ts. i have added uri in : "f:\Job Projects\product-feedback-board\.env". after that create the schema and indexes as mentioned in : "f:\Job Projects\product-feedback-board\SPEC.md"
5. install gsap and motion. and wait for my command
6. read : "f:\Job Projects\product-feedback-board\AGENTS.md" and make sure follow the command mentioned there.
7. adjust spec.md then. so that we dont face any logic conflict
8. now before we proceed with phase 2 and further , check phase 0 & 1 cross check with the best practice mentioned in "f:\Job Projects\product-feedback-board\AGENTS.md".
9. search web and also check `node_modules/next/dist/docs/` to fix the issue :
F:\Job Projects\product-feedback-board>npm run seed

> product-feedback-board@0.1.0 seed
> npx tsx scripts/seed.ts

◇ injected env (1) from .env.local // tip: ⌁ auth for agents [www.vestauth.com]
Connecting to MongoDB...
Seed failed: MongooseServerSelectionError: Could not connect to any servers in your MongoDB Atlas cluster. One common reason is that you're trying to access the database from an IP that isn't whitelisted. Make sure your current IP address is on your Atlas cluster's IP whitelist: https://www.mongodb.com/docs/atlas/security-whitelist/
    at _handleConnectionErrors (F:\Job Projects\product-feedback-board\node_modules\mongoose\lib\connection.js:1180:11)
    at NativeConnection.openUri (F:\Job Projects\product-feedback-board\node_modules\mongoose\lib\connection.js:1111:11)
    at async seed (F:\Job Projects\product-feedback-board\scripts\seed.ts:48:3) {
  errorLabelSet: Set(0) {},
  reason: TopologyDescription {
    type: 'Unknown',
    servers: Map(1) {
      'cluster0.uwwtyq1.mongodb.net:27017' => [ServerDescription]
    },
    stale: false,
    compatible: true,
    heartbeatFrequencyMS: 10000,
    localThresholdMS: 15,
    setName: null,
    maxElectionId: null,
    maxSetVersion: null,
    commonWireVersion: 0,
    logicalSessionTimeoutMinutes: null
  },
  code: undefined,
  cause: TopologyDescription {
    type: 'Unknown',
    servers: Map(1) {
      'cluster0.uwwtyq1.mongodb.net:27017' => [ServerDescription]
    },
    stale: false,
    compatible: true,
    heartbeatFrequencyMS: 10000,
    localThresholdMS: 15,
    setName: null,
    maxElectionId: null,
    maxSetVersion: null,
    commonWireVersion: 0,
    logicalSessionTimeoutMinutes: null
  }
}

F:\Job Projects\product-feedback-board> 
10. [Image 1] i have added that to my ip as u can see in the image btw in online i got a solution like "// Source - https://stackoverflow.com/a/79875907
// Posted by Sudarsan Sarkar, modified by community. See post 'Timeline' for change history
// Retrieved 2026-07-20, License - CC BY-SA 4.0

import dns from "node:dns/promises";

dns.setServers(["1.1.1.1", "1.0.0.1"]); "

11. verify if the seed is success now : "F:\Job Projects\product-feedback-board>npm run seed

> product-feedback-board@0.1.0 seed
> npx tsx scripts/seed.ts

◇ injected env (1) from .env.local // tip: ⌘ custom filepath { path: '/custom/path/.env' }
Connecting to MongoDB...
Connected.

Cleared existing data.

Inserted 30 feedback documents.

Inserted 85 vote tracker documents.

Feedback indexes: [
  '_id_',
  'voteCount_1',
  'FeedbackTextIndex',
  'category_1_priority_1_createdAt_-1',
  'category_1_priority_1_voteCount_-1',
  'category_1_priority_1_priorityWeight_-1',
  'createdAt_-1'
]
VoteTracker indexes: [ '_id_', 'feedbackId_1_voterId_1' ]

Done. Disconnected.

F:\Job Projects\product-feedback-board> "
12. proceed with phase 2
13. proceed (phase 3)
14. now phase 4 & 5
15. now phase 6
16. now revise phase 2-6. from : "f:\Job Projects\product-feedback-board\TASKS.md".
17. now phase 7,8,&9
18. now phase 10