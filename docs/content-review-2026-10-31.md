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

34 gallery images across 17 project galleries are now used. Covers are the initial card image. At Xavier's request, autoplay has been removed entirely. Multi-image cards have previous/next arrow buttons and gallery dialogs retain previous/next buttons, thumbnails and keyboard navigation. Navigation stops at the first and last images. Clicking a preview opens the currently displayed image. Cover selections will be curated with Xavier one project at a time.

- **Artmeet:** the Malaysia job-listing interface is the cover; its page introduction and original marketing captures follow.
- **TheraLink:** therapist search is the cover, followed by the homepage.
- **SenangPrint:** signed-in storefront and brochure quantity-pricing UI, plus the older published storefront screenshot. No customer orders, account records, addresses, or payment information were captured.
- **Segi Fresh:** a single unchanged screenshot supplied and selected by Xavier shows a recorded shelf view, region overlays and evidence-review status. It replaces the earlier overview and check-rule captures, which were removed from current public files. The portal address is withheld from the site, captions, source links and provenance. The screenshot is not a claim of live store conditions or validated AI results. No operational settings were changed.
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


## Screenshot framing review

Artmeet's confirmed cover remains the Malaysia job-listing capture. All screenshot covers now fit the full source image inside their canvas, with padding and no hover zoom. Navigation and gallery links sit in a separate toolbar below the image, so controls cannot obscure logos, headers, or interface content. Open-source and earlier-work cards use full-width image canvases rather than narrow side strips; placeholder covers use the same card orientation for consistent rows.

Portrait app covers retain their original proportions. Very long gallery images (height greater than three times width) are displayed at readable width in a keyboard-focusable scroll region, with a scroll hint, rather than being compressed to the gallery's height. Other gallery images still fit the available screen. Thumbnail images also preserve the complete source frame.

The source screenshots, cover choices, ordering, provenance, private-portal address handling, and manual-only carousel behavior are unchanged. Browser review covers desktop and mobile framing, complete-image fitting, controls outside image bounds, restored map attribution, and the long UniLah design's scrollable gallery. No original media files were edited.


## Featured project, personal introduction and browsing polish

LOKA Maps is the featured/latest project at Xavier's request. Its hero uses the Explore desktop-and-mobile composition, a direct link to the public app, a link to its manual gallery, and visible OpenStreetMap/OpenMapTiles attribution. The featured gallery explicitly starts at the hero's shown image even if the directory's LOKA carousel has been moved to another image. LOKA remains in the directory; the total remains 22 projects.

A short introduction precedes the hero. The displayed LinkedIn profile was reviewed again on 31 October 2026. Its headline identifies Xavier as a senior software engineer, AI/ML engineer and former startup founder; the introduction condenses those roles, without repeating its adoption-count claim or employment details. Xavier explicitly requested his profile photograph. The displayed original 400x400 JPEG was downloaded unchanged and is hosted locally so the site does not depend on an expiring LinkedIn CDN URL. Its hash and public profile origin are in the media provenance manifest.

The page now has one H1 (Xavier's introduction), a featured-project H2, and a smaller directory heading. The skip link jumps directly to the directory. Search and category filters remain visible while browsing, with an explicit reset control, an empty-results recovery action, Escape to clear the search, and the existing slash shortcut. Resetting category filters also brings the selected category into view on narrow screens. No autoplay was reintroduced.

Desktop, tablet and mobile layouts were reviewed at 320, 390, 768 and 1440 CSS pixels, with no horizontal overflow or heading clipping. Light and dark appearances, the original portrait, gallery opening, map credits, category counts, earlier-work expansion, empty search results, reset behavior and search clearing were checked. Main text and action colors pass a 4.5:1 contrast check. Cover choices, private portal handling and existing full-image framing remain unchanged.

## LOKA curated desktop and mobile gallery

At Xavier's request, LOKA now has three 1600×1000 presentation images: Explore (cover and featured hero), Planner, and Navigate. Each pairs the full desktop and mobile interface in a consistent LOKA forest/apricot layout. Original screen contents are not retouched. Earlier default-map and empty-directions captures are superseded in the gallery.

Planner shows the real computed driving route from Sunway Velocity Mall to Mid Valley Megamall. Navigate shows the same trip just beyond halfway, with public coordinates replayed as simulated GPS. The composition and caption label it as a demo, not a recorded drive or physical navigation validation. Route estimates and unknown toll information are preserved from the interface. OpenStreetMap/OpenMapTiles attribution is visible in the images and gallery.

The capture session used an isolated origin with account/report mutations blocked. No personal saved trip or real device location appears in the captures. The synthetic trip and saved fix were cleared, navigation ended, and GPS and viewport overrides removed. Source and composition hashes are recorded in [LOKA media provenance](loka-media-provenance.json). Manual carousel controls remain unchanged.

## Gallery behaviour update (supersedes the composite-based LOKA gallery above)

- **Covers are separate from gallery images.** A project may define a `cover`. LOKA's directory card keeps the existing Explore desktop-and-mobile composite (`loka-explore-desktop-mobile.jpg`) as its cover; it has no cover carousel arrows and its count reads "3 views". The composites are no longer gallery images.
- **LOKA gallery** uses the separate unaltered desktop and mobile screenshots for Explore, Planner and Navigate (`loka-desktop-*.jpg`, `loka-mobile-*.jpg`). Desktop and mobile always change together; each has its own full-size link. Source screenshot bytes are unchanged; the three desktop/mobile pairs were captured at 1440×900 and 390×844 viewports.
- **Hero** shows the raw Explore desktop screenshot inside one browser frame, with the raw Explore phone screenshot floating over its lower-right corner. Both open the gallery at Explore. The hero now follows the page's light/dark theme instead of a fixed green panel.
- **Mobile-only galleries** (currently UniLah) show up to three phone screenshots per page on viewports wider than 700px and one per page at 700px or narrower. The current screenshot position is kept when the viewport crosses that breakpoint. Each phone frame scrolls independently, so long images can be read in full, and each has its own full-size link.
- **Single desktop galleries** keep manual navigation, thumbnails, keyboard arrows and the scrollable treatment for very tall images.
- **Earlier work** is no longer collapsed. All earlier-work cards are always visible, including without JavaScript; search and category filtering are unchanged.

Capture conditions: screenshots came from the public app through an isolated, write-blocking loopback proxy. Navigation GPS was simulated just beyond halfway from Sunway Velocity Mall to Mid Valley Megamall; it is not a recorded drive. These notes describe the implementation; browser acceptance checks are performed separately.

## Project grouping refinement

The opening sequence is the personal introduction, featured LOKA project, then Built end-to-end, Contributions, Side projects, Open source, Apps & hackathons, and Earlier work. Segi Fresh belongs with the four end-to-end builds; Contributions contains Wiseway, UniLah and Codevio. Roles remain explicit so co-founding, contracting and employment are not conflated. Earlier work is fully expanded.

## Optional cyberpunk RPG world

The RPG journal is now the default directory at `/`. The former minimalist style is named Clean and lives at `/clean/`; `/rpg/` remains a compatibility alias of the root RPG page. The header links between RPG and Clean with an explicit active state. All outputs share the same project and gallery data. The style choice does not persist or redirect the default entry point. Appearance remains a separate shared light/dark preference.

The RPG opening places the introduction and featured LOKA spread inside an original pixel-art neon city, with foreground skyline silhouettes and slow ambient lights. The night scene remains readable in either appearance; the compendium follows the selected appearance. Chapters use a margin trail and waypoint markers on large screens, lighter project frames and an open side-project spread. The user's RPG Maker origin is included without claiming a shipped game. There is no gameplay gate, invented experience score, sound, or automatic gallery playback. Decorative animations stop for reduced-motion preferences.

The city is generated illustration, not evidence of a project or a product screenshot. Its original bytes and generation prompt are recorded in [city art provenance](rpg-city-art-provenance.json). Product screenshots and the portrait remain unchanged and unfiltered. The unused forest concept was not included in this deployment.

## Compact browsing and cyberpunk companions

Visitors without an appearance preference now start in dark mode. Explicit Light, Dark and System choices are retained. The browser theme color follows the resolved appearance.

The directory uses five filters: All, Built, Contributions, Independent and Earlier. Independent combines the three existing independent-work sections for filtering only; the six section labels, project membership and ordering are unchanged. Visible project totals and section-count badges are removed while live announcements remain available to assistive technology. The toolbar is one 60px row that reduces to 48px after scrolling past it, with an icon-only search trigger at the right. Search opens a native dialog using the trigger, Ctrl/Command-K or `/`, searches full original descriptions, supports arrow keys and Enter, and restores focus on dismissal. Selecting a project reveals its card even if the current category had hidden it.

Cards use concise complete summaries, smaller spacing, 16px body copy, 20px readable titles and full uncropped screenshot previews. Original descriptions remain in the source data and search index. Cover carousels have been replaced by one View screens link; galleries retain manual previous/next navigation and synchronized device pairs. At 1280×720 the tallest card measured 497px; at 320px width the tallest measured 564px. Earlier-work entries remain directly visible when not explicitly filtered out.

Original SVG pixel artwork adds a visor-wearing traveller, scout drone, toolkit, relay, holographic map, terminal, arcade cabinet and retro computer. On wide screens the traveller follows chapter progress in a separate left gutter and changes pose; below 1280px a smaller traveller stays in the compact toolbar. Each chapter has a relevant object. The global motion control and native reduced-motion preference pause decorative movement, and opening a gallery or search palette pauses the background. The SVG assets contain source geometry rather than retouched project screenshots.

Browser checks cover the 320px and 768px layouts and the 1440px desktop composition, light and dark appearances, header style comparison, the synchronized Planner pair, four directly visible earlier-work entries, and reduced-motion behavior. Shared data checks confirm 22 projects, six categories, 17 galleries, and exactly one user-approved Segi image. The public page sources contain no operational portal URL.


## World craft and reading flow refinement

The opening now leads with Xavier's name, portrait, professional headline and personal RPG Maker origin, followed by LOKA. The generic adventure slogan is removed. LinkedIn belongs to the identity block. A compact phone layout saves about 100px over the first revised vertical intro. Chapter descriptions are shorter; project descriptions, roles, links, covers and gallery data remain unchanged. Segi's public card says "Private deployment" instead of discussing screenshot selection.

The typography uses Pixelify Sans for display headings, Inter for body and card names, and JetBrains Mono for labels. The UI stays cyan with cooler slate neutrals; the original city illustration and all product screenshots are unchanged. Original code-drawn `rpg/city-block.svg` adds layered roofs, antennas, windows, conduits and street lighting behind chapter headings only. It is decorative art, not project evidence. Chapter objects stand on one ground line. The traveller is a filled 24×33 pixel figure at exact 2× desktop and 1× toolbar scale; stationary props no longer bob or glow all over.

The condensed toolbar masks its unused tail without a layout shift. The gallery header stays visible while scrolling and each opening resets the dialog to the top; paired device loading and manual navigation are retained. Dialog entrance fades respect reduced motion. Clean keeps its design and shared content, with the gallery usability fix.

Primary reference research informed principles rather than reused assets: [Pixel Jeff's City Centre](https://pixeljeff1995.artstation.com/projects/kDe5kz) for layered architecture and grounded objects; [Bruno Simon](https://bruno-simon.com/) for a continuous world identity; [Brittany Chiang](https://brittanychiang.com/) for clear identity, roles and project scanning. No third-party reference artwork is published here.

Host checks confirm the 22 project entries retain all names, roles, full descriptions, source links and gallery assets. At 1280×720 the tallest card is about 495px; 320px layouts have no horizontal overflow. Search/keyboard focus, synchronized Planner screenshots, theme switching, motion pause and Clean/RPG switching were exercised in the browser. The single approved Segi image and confidential-URL restriction remain intact.
