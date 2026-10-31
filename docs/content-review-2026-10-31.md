# Content and media review — 31 October 2026

This directory is a personal portfolio. Role descriptions are Xavier's account, checked for consistency against his supplied text, main portfolio, LinkedIn profile and article, and available product/repository descriptions. Public marketing copy is not independent proof of adoption, performance, security, or authorship.

## Editorial decisions

- Organised 22 entries into built/co-founded products, contributions, side projects, open source, apps/hackathons, and earlier work.
- Kept TheraLink explicitly marked as contract development. Contributions are separate from founded products.
- Condensed role descriptions and removed repeated technology inventories.
- Omitted user/adoption counts and unverified performance improvements. No financial, security, healthcare, or AI-accuracy guarantees are made.
- Segi Fresh is described as a pilot. The supplied five-store count and 160+ store rollout plan are not presented as independently confirmed or nationwide deployment.
- No current-employer or employment-date claims: the older portfolio lists Wiseway as current while the live LinkedIn profile shows FeedMe.
- SenangPrint initially showed a maintenance notice publicly. A later signed-in browser session exposed its storefront and product configurator. Screenshots distinguish current session captures from the archived blog image; no current ordering availability is claimed.
- Road to AI is explicitly in progress; its live interface shows unfinished curriculum tiers. Better Grid and Auth0 Manager are also marked in progress, consistent with repository metadata.
- Citector is archived according to GitHub metadata; no defunct demo URL is used.
- Earlier work remains without outgoing project links, matching the user's requested treatment even where a repository is public.

## Public sources reviewed

- [Main portfolio](https://www.xavierloo.com/), plus its Artmeet, SenangPrint, Wiseway, UniLah, and TheraLink case studies and resume.
- [LinkedIn profile](https://www.linkedin.com/in/xavier-loo/) — signed-in browser review of profile and About text. The profile's current employer is visible, but project claims remain self-reported.
- [LinkedIn article: Technopreneur Dream of a Kampung Boy](https://www.linkedin.com/pulse/technopreneur-dream-kampung-boy-xavier-loo-e3snc) — supports the personal account of co-founding/engineering Artmeet and SenangPrint and the UniLah technical-lead role.
- [Vulcan Post, 24 Dec 2021](https://vulcanpost.com/773397/artmeet-malaysia-job-portal-creative-graphic-designers/) — describes Artmeet and identifies CTO Xavier among the co-founders.
- [Disruptr, 10 Jul 2023](https://www.disruptr.com.my/artmeet-the-marketplace-connecting-creatives-and-recruiters/) — describes Artmeet's creative marketplace and its connection to SenangPrint. Historical numbers were not reused as current counts.
- [Yahoo News press link supplied by Xavier](https://malaysia.news.yahoo.com/magic-looking-future-tech-founders-035606920.html) — HTTP 200 and the MaGIC article title verified; the article body was not reliably extractable. Retained as a supplied press reference; no award claim relies on this link.
- [Artmeet](https://www.artmeet.com/), [SenangPrint](https://www.senangprint.com/), [TheraLink](https://www.theralink.my/), [LOKA Maps](https://lokamaps.app/), [Wiseway](https://www.wiseway.ai/), and [UniLah](https://myunilah.com/) — live public website inspection. This confirms the presented interface, not all advertised claims.
- GitHub public metadata and READMEs for all six OSS entries and both hackathon entries. InvestHack and Hyperdrive participation descriptions come from their project repositories; no awards are implied.

## Media provenance

Public website captures taken on 31 October 2026:

| Local asset | Source | Treatment |
| --- | --- | --- |
| `artmeet-home.png`, `artmeet-platform.png` | Artmeet public website | Website previews, not a claim about current user numbers |
| `theralink-home.png`, `theralink-search.png` | TheraLink public homepage and therapist search | Public UI captures; no appointments or private accounts accessed |
| `loka-map.png`, `loka-directions.png` | LOKA Maps | Default public map and empty directions panel; location permission not used; map attribution included in gallery |
| `unilah-home.png` | UniLah public website | Current marketing site, not represented as the historical app UI |
| `cve-watcher.png` | CVE Watcher | Public advisory list and stack filters |
| `road-to-ai.png` | Road to AI | Public learning trail |
| `lockscreen-demo.gif` | Public `jvloo/lockscreen-dah-macos/docs/demo.gif` | Original repository demo |

Archived Wiseway media was specifically requested by Xavier from `jvloo-archived`. The matching local `wise-frontend-app` clone points at that organisation. Its screenshot README identifies the captures as QA example data, made on 27 October 2026. Three images were visually reviewed, copied without edits, and checked against the archive's recorded SHA-256 values. These show the **core Wiseway platform**, not WiseProp or WisePower. No suitable standalone WiseProp/WisePower screenshots were found in their main-branch archives. Public gallery source links go to the company website rather than private repositories or QA routes.

See [Wiseway media hashes](wiseway-media-provenance.json). Profile, company settings, billing, users, and unsubmitted-feedback screenshots were excluded. No private source code or working notes were copied into the public site.

Projects without suitable reviewed images use a labelled preview placeholder. Placeholders are abstract identity covers and do not depict invented product screens.


## Additional media recovery and gallery update

34 screenshots across 17 project galleries are now used. Covers are the initial card image. At Xavier's request, autoplay has been removed entirely. Multi-image cards have previous/next arrow buttons and gallery dialogs retain previous/next buttons, thumbnails and keyboard navigation. Navigation stops at the first and last images. Clicking a preview opens the currently displayed image. Cover selections will be curated with Xavier one project at a time.

- **Artmeet:** the Malaysia job-listing interface is the cover; its page introduction and original marketing captures follow.
- **TheraLink:** therapist search is the cover, followed by the homepage.
- **SenangPrint:** signed-in storefront and brochure quantity-pricing UI, plus the older published storefront screenshot. No customer orders, account records, addresses, or payment information were captured.
- **Segi Fresh:** staging overview status cards and store check rules only. The overview capture excludes camera images. The portal address is withheld from the site, image captions, public source links, and provenance. No rules, pipeline controls, or analysis requests were changed.
- **UniLah:** Home (`1983:57028`) and UniDeals (`647:8199`) were handpicked and exported from the supplied original Figma file. Home is the cover. These are app designs, not current production app screenshots. Home's John Doe profile is sample design content. Long portrait screens remain available through the full-size image link.
- **Auth0 Manager:** original Python/Tkinter UI recovered from public source. A separate local launcher supplies 12 fictional users using `example.com`, six fictional organizations, and original model classes. Configuration storage is isolated; socket connections are disabled. Captures show Users, Organizations, a Block confirmation (cancelled), and a cleanup dry-run preview. No real tenant credentials were read or used; no real accounts were changed. The app's unmodified view methods render the supplied fixtures.
- **Better Grid:** the original existing playground's financial-data and cell-types examples, with its built-in example data. No source changes were made to that repository.
- **PopCat PopBot:** original screenshots linked from the README, rather than stock assets.
- **KL Properties / PropSight:** the original README-linked Shiny demo's home and screening-map views. The historical coursework dataset is not presented as current property pricing. OpenStreetMap attribution is retained.
- **ArtCert:** original React LandingPage/Header/Footer components and stylesheet rendered locally. A minimal React 18 / Router 5 frontend harness avoids the repository's incompatible Router 6 declaration and unused backend packages. No Firebase or blockchain backend is connected. Screenshot captions describe a frontend preview rather than functional certification.
- **Citector:** original PHP page's empty-data HTML/editor and original styles/fonts rendered locally. PHP processing was not restored. No citation-result data was invented.
- **Investbook:** original mobile sign-in template and stylesheet rendered locally. PHP helpers were replaced with local paths, server expressions were omitted, and scripts making backend requests were excluded. No account sign-in or media upload was attempted.

The restored frontend harnesses and fixture data are disposable, ignored local working files. Source tree SHAs, capture classifications, origins, and media hashes are recorded in [additional media provenance](additional-media-provenance.json).

Five placeholders remain: Codevio partner projects, Agentisan, the early chatroom, anonymous social platform, and club/society app. Repository trees, README-linked media, available releases/issues, and selected alternate branches were checked. Codevio has no suitable product capture; private contact-card photos were excluded. Agentisan has a terminal dashboard but no reviewed screenshot, and the current machine has no Rust toolchain for a source build. The anonymous platform's original view depends on missing application/API state; an incomplete or invented feed is not published. The chatroom and club app have no confidently matched source repository in the reviewed set.

Validation: static build, JavaScript syntax, diff whitespace, image existence and privacy-string scans passed. Browser checks confirmed initial cover ordering, card previous/next buttons, gallery previous/next buttons, the absence of playback controls and timers, first-image boundary handling, opening the selected preview in its gallery, and mobile width containment. Captures were visually reviewed before publication.
