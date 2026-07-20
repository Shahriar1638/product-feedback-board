import { config } from "dotenv";
import dns from "node:dns/promises";
config({ path: ".env.local" });

dns.setServers(["1.1.1.1", "1.0.0.1"]);

import mongoose from "mongoose";
import type { Category, Priority } from "../src/types/feedback.types";
import Feedback from "../src/models/Feedback.model";
import VoteTracker from "../src/models/VoteTracker.model";

const MONGODB_URI = process.env.MONGODB_URI!;
if (!MONGODB_URI) throw new Error("Missing MONGODB_URI");

const PRIORITY_WEIGHT: Record<Priority, number> = { Low: 1, Medium: 2, High: 3 };

const titles: { title: string; description: string; category: Category; priority: Priority }[] = [
  { title: "Dashboard fails to load on mobile Safari", description: "When opening the dashboard on iOS Safari 17+, the page hangs on a white screen. Desktop Chrome works fine. Console shows a chunk loading error.", category: "Bug", priority: "High" },
  { title: "Dark mode toggle", description: "Add a dark/light mode toggle in the settings panel. Should respect system preference by default and persist the user's choice in localStorage.", category: "Feature", priority: "Medium" },
  { title: "Optimize image loading", description: "Large product images cause layout shift on slow connections. Implement lazy loading with blur-up placeholders.", category: "Improvement", priority: "Medium" },
  { title: "CSV export for reports", description: "Export button on the analytics page should download a CSV file with the current filtered dataset.", category: "Feature", priority: "Low" },
  { title: "Form validation error messages", description: "When submitting the feedback form with empty fields, no error message appears. The submit button just does nothing.", category: "Bug", priority: "High" },
  { title: "Keyboard navigation for cards", description: "Cards in the grid should be navigable with arrow keys and activatable with Enter for accessibility compliance.", category: "Feature", priority: "Medium" },
  { title: "Reduce bundle size", description: "The main bundle is 380KB gzipped. Tree-shake unused lodash imports and consider replacing moment.js with date-fns.", category: "Improvement", priority: "High" },
  { title: "Search returns wrong results", description: "Searching for 'login' returns items that don't contain the word. The text index seems to be matching partial tokens incorrectly.", category: "Bug", priority: "Medium" },
  { title: "Email notifications for new feedback", description: "Admins should receive a daily digest email when new feedback items are submitted.", category: "Feature", priority: "Low" },
  { title: "Fix z-index layering on modals", description: "The confirmation modal sometimes appears behind the toast notifications. Modals should always be on top.", category: "Bug", priority: "Medium" },
  { title: "Bulk delete selected items", description: "Allow selecting multiple feedback items and deleting them in one action with a checkbox toggle per card.", category: "Feature", priority: "Medium" },
  { title: "Improve time-to-first-byte", description: "Server response times average 1.2s on the feedback list endpoint. Add caching headers and consider a CDN.", category: "Improvement", priority: "High" },
  { title: "Avatar upload for user profiles", description: "Let users upload a profile picture. Should be cropped to a circle and stored in S3.", category: "Feature", priority: "Low" },
  { title: "Rate limiter blocks legitimate users", description: "Users on shared office IPs are getting rate limited after 3 requests. The window should be per-user, not per-IP.", category: "Bug", priority: "High" },
  { title: "Animate filter transitions", description: "When switching categories, cards should animate smoothly into their new positions instead of snapping.", category: "Improvement", priority: "Low" },
  { title: "Broken pagination on page 2+", description: "Clicking 'Next' on the feedback list loads the same first page again. The offset parameter is being ignored.", category: "Bug", priority: "High" },
  { title: "Tag system for feedback", description: "Allow adding freeform tags to feedback items for cross-category grouping. Tags should be autocomplete from existing ones.", category: "Feature", priority: "Medium" },
  { title: "Improve color contrast ratios", description: "Several text elements fail WCAG AA contrast checks against their backgrounds. Audit and fix all low-contrast pairs.", category: "Improvement", priority: "Medium" },
  { title: "Login page crashes on invalid email", description: "Entering an email without an @ symbol and submitting causes a 500 error instead of a validation message.", category: "Bug", priority: "Medium" },
  { title: "Sorting by priority level", description: "Add a sort option that orders feedback by priority (High > Medium > Low) using the priorityWeight field.", category: "Feature", priority: "Low" },
  { title: "SSR data fetching for SEO", description: "The feedback detail pages should be server-rendered so search engines can index the content properly.", category: "Improvement", priority: "Medium" },
  { title: "Vote count drifts after concurrent votes", description: "When two users vote at the same time, the displayed count sometimes doesn't match the database value.", category: "Bug", priority: "High" },
  { title: "Keyboard shortcut for search", description: "Pressing Cmd/Ctrl+K should focus the search input from anywhere on the page.", category: "Feature", priority: "Low" },
  { title: "Migrate to React 19 features", description: "Replace useEffect-based patterns with use() hook and useOptimistic for vote state management.", category: "Improvement", priority: "Low" },
  { title: "Stale cache after feedback edit", description: "After editing a feedback item, the list still shows the old title until a hard refresh. Cache invalidation is missing.", category: "Bug", priority: "Medium" },
  { title: "Role-based access control", description: "Add admin vs regular user roles. Only admins should be able to delete feedback and manage categories.", category: "Feature", priority: "High" },
  { title: "Compress API responses", description: "Enable gzip/brotli compression on API responses. The feedback list endpoint returns 45KB uncompressed.", category: "Improvement", priority: "Low" },
  { title: "Double submit on slow connections", description: "Clicking submit twice on a slow connection creates duplicate feedback entries. Disable the button after first click.", category: "Bug", priority: "High" },
  { title: "Feedback detail view", description: "Clicking a card should expand to show the full description, all votes, and comments if any.", category: "Feature", priority: "Medium" },
  { title: "Database connection pooling", description: "Under load, MongoDB connections exhaust. Implement connection pooling with proper timeout handling.", category: "Improvement", priority: "High" },
];

async function seed() {
  console.log("Connecting to MongoDB...");
  await mongoose.connect(MONGODB_URI);
  console.log("Connected.\n");

  await Feedback.deleteMany({});
  await VoteTracker.deleteMany({});
  console.log("Cleared existing data.\n");

  const now = Date.now();
  const DAY = 86_400_000;

  const feedbackDocs = titles.map((item) => {
    const daysAgo = Math.floor(Math.random() * 60);
    const createdAt = new Date(now - daysAgo * DAY - Math.floor(Math.random() * DAY));
    const upvotes = Math.floor(Math.random() * 120);
    const downvotes = Math.floor(Math.random() * 20);

    return {
      title: item.title,
      description: item.description,
      category: item.category,
      priority: item.priority,
      priorityWeight: PRIORITY_WEIGHT[item.priority],
      upvotes,
      downvotes,
      voteCount: upvotes - downvotes,
      createdAt,
      updatedAt: createdAt,
    };
  });

  const insertedFeedback = await Feedback.insertMany(feedbackDocs);
  console.log(`Inserted ${insertedFeedback.length} feedback documents.\n`);

  const voterIds = Array.from({ length: 15 }, (_, i) => `seed-voter-${i}`);
  const voteDocs: { feedbackId: mongoose.Types.ObjectId; voterId: string; voteType: "up" | "down"; createdAt: Date }[] = [];

  for (const doc of insertedFeedback) {
    const numVotes = Math.floor(Math.random() * 5) + 1;
    const shuffled = [...voterIds].sort(() => Math.random() - 0.5);

    for (let v = 0; v < numVotes && v < shuffled.length; v++) {
      voteDocs.push({
        feedbackId: doc._id,
        voterId: shuffled[v],
        voteType: Math.random() > 0.3 ? "up" : "down",
        createdAt: new Date(now - Math.floor(Math.random() * 30 * DAY)),
      });
    }
  }

  const insertedVotes = await VoteTracker.insertMany(voteDocs);
  console.log(`Inserted ${insertedVotes.length} vote tracker documents.\n`);

  const feedbackIndexes = await Feedback.collection.indexInformation();
  const voteIndexes = await VoteTracker.collection.indexInformation();
  console.log("Feedback indexes:", Object.keys(feedbackIndexes));
  console.log("VoteTracker indexes:", Object.keys(voteIndexes));

  await mongoose.disconnect();
  console.log("\nDone. Disconnected.");
}

seed().catch((e) => {
  console.error("Seed failed:", e);
  process.exit(1);
});
