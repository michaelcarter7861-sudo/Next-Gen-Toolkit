# Final User and Market Research

Retrieved: 2026-11-16. **The brief asked for at least 30 real public feedback items with URLs.**
This run collected 0 items from primary feedback platforms: Reddit, the Chrome Web Store, the
App Store/Play Store review pages and vendor support forums were not reachable from the sandbox
egress policy, and I refuse to reconstruct quotes from memory. **This section is therefore
incomplete on purpose and marked unavailable.** Two secondary signals that *were* read are
recorded below, both labelled by source type.

## Signals actually observed

| Date | Source | Type | Signal |
|---|---|---|---|
| 2026-11-16 | trustpilot.com/review/smallpdf.com | Aggregator, unverified reviews | 4.8/5 over 5,535 reviews, but Trustpilot's own AI summary of the text highlights "unexpected charges and confusing subscription policies" and tools that "did not work as smoothly as expected" |
| 2026-11-16 | smallpdf.com/help (FAQ) | Vendor statement | Vendor states uploaded files are deleted from its servers after processing — a common source of user anxiety |
| 2026-11-16 | sejda.com/upgrade | Vendor pricing page | A desktop (local) tier is sold alongside the web tier, i.e. some users actively pay to avoid uploading |

Reading of the first row: the aggregate score and the complaint themes disagree. A high star
average with recurring billing complaints is the pattern of a product people use once for a
deadline and then forget they subscribed to. That is the retention problem our no-account
model dodges and also the retention problem it creates (no reason to come back).

## Hypotheses (explicitly labelled as hypotheses)

These are untested. They are written down so the next research pass can try to falsify them.

- **H1 — the ceiling is the job.** Users do not want "compression"; they want a number. Forms,
  portals and email attachments state a maximum, and the failure mode is "rejected at the
  upload box". Exact-KB output is the feature, quality is the compromise users accept.
- **H2 — the trust question is "where is my file", not "is this free".** Vendor FAQs spend
  paragraphs on deletion policies; that is where the anxiety lives.
- **H3 — mobile is the real device.** Photo uploads to portals happen on a phone, at night,
  before a deadline. A desktop-first layout that works at 375 px is table stakes; the ceiling
  tool must be usable one-handed.
- **H4 — the second visit is a different job.** Someone compressing a passport photo today
  needs a signature tomorrow and a PDF split next week. A suite beats a single tool only if the
  tools are discoverable from each other.

## Test protocol for the missing primary research (ready to run)

1. Recruit 8–12 participants who have submitted an online application in the last 12 months
   (Pakistan, India, Bangladesh). One 20-minute session each, screen-shared, no leading script.
2. Task 1: "make this 4 MB photo acceptable for a form that says 20 KB". Observe whether they
   search for a tool, use one they know, or give up; record the words they type into search.
3. Task 2: same for a 3-page PDF that must become 2 pages. Record whether they trust the
   preview before downloading.
4. Instrument: time to first successful download, number of wrong turns, and their unprompted
   answer to "how do you know your file wasn't uploaded?".
5. Publish raw notes in `audit/final/` under a dated file; never paraphrase a participant quote
   into marketing copy without written permission.

## Market sizing

Not attempted this run. Any TAM number for "online file tools" would be invented. The only
defensible statement is relative: the queries we target ("compress image to 20kb", "pdf to
jpg", "split pdf") are high-intent and price-sensitive, and every verified competitor either
meters them or watermarks the output.
