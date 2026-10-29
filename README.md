# RO’Lyfe Property Research Intelligence Engine™

**Repository name:** `rolyfe-property-research-intelligence`  
**Short description:** A multi-source real-estate research and auction due-diligence workspace for tax sales, foreclosures, off-market leads, comparable sales, title risks, and acquisition underwriting.

## Mission

Research properties across Pennsylvania, New Jersey, New York, and other U.S. markets; organize auction opportunities; verify facts across sources; calculate conservative all-in acquisition costs; and prepare a documented decision package before contacting a lender, contractor, buyer, or funding partner.

This is a research and decision-support system—not a title opinion, legal opinion, appraisal, loan commitment, or guarantee of property availability.

## Core workflow

1. **Discover** — find properties through GovEase, RealAuction, Bid4Assets, GovDeals, Auction.com, county tax-claim offices, sheriff sales, and ordinary listing sites.
2. **Identify** — standardize the address, county, parcel/APN, property type, and sale identifier.
3. **Cross-check** — compare Zillow, Redfin, public records, county assessment/tax data, Regrid, Propwire, listing history, and available comparable sales.
4. **Classify the sale** — distinguish tax lien/certificate, upset sale, judicial sale, deed sale, mortgage foreclosure, sheriff sale, bank-owned/REO, and ordinary listing.
5. **Underwrite** — estimate market value/ARV, repairs, taxes, fees, premiums, carrying costs, financing, and exit options. Clearly label sourced facts versus estimates.
6. **Risk review** — investigate title/lien status, redemption rights, occupancy, access, zoning/use, utilities, flood risk, HOA, condition, and sale terms.
7. **Decision gate** — mark as Research, Verify, Contractor Review, Title Review, Lender Review, Offer-Ready, Pass, or Archived.
8. **Package** — prepare a property research report and a clean document folder.
9. **Partner handoff** — only after verification, share the appropriate package with a loan officer, lender, contractor, buyer, or other authorized partner.
10. **Follow-up marketing** — use SendFuse for compliant, permission-based outreach only after the property facts and intended offer/assignment structure have been reviewed.

## Research sources and roles

| Source | Intended use | Important limitation |
|---|---|---|
| [GovEase](https://www.govease.com/tax-sale-property-auctions) | Participating county tax-sale auctions and sale documents | Sale types and rules are county/state-specific; opening bid is not total cost |
| [RealAuction](https://www.realauction.com/) | Jurisdiction-specific tax, foreclosure, and other auctions | Only participating jurisdictions; verify county and sale terms |
| [Bid4Assets](https://www.bid4assets.com/) | Tax sales, government sales, and other auctions | Confirm property, deposit, premium, deadlines, and title/occupancy terms |
| [GovDeals](https://www.govdeals.com/) | Government surplus and real-estate listings | Listing type and seller terms vary |
| [Auction.com](https://www.auction.com/) | Mortgage foreclosure and bank-owned property opportunities | Auction status, access, occupancy, title and closing terms must be checked |
| [Zillow](https://www.zillow.com/) | Listing photos, estimates, listing history, property details | Estimates are not appraisals; data may be stale or refer to a different unit |
| [Redfin](https://www.redfin.com/) | Listings, price history, comparable sales and property facts | Verify against county records and the exact property |
| [Philadelphia property lookup](https://property.phila.gov/) | Philadelphia address/OPA account, assessment and tax information | Confirm parcel identity and current official records |
| [Regrid](https://regrid.com/) | Parcel boundaries, parcel identifiers, land/property context | Parcel data does not replace title work or a survey |
| [Propwire](https://propwire.com/) | Lead research and property/owner indicators | Verify ownership, mortgage/equity indicators, and contact data independently |
| County tax claim office / sheriff / recorder / assessor | Official sale notices, assessment, taxes, deed records, sale terms | Use the actual county for the parcel; save source and retrieval date |
| SendFuse | Later-stage outreach and campaign workflow | Use only after compliance review, accurate claims, appropriate consent, and contact-list permissions |

## Initial geographic focus

Start with counties that are practical for a family buyer near New York City, then expand nationally when the research process is reliable.

Suggested starting watchlist (not a guarantee of affordable inventory):
- Pennsylvania: Monroe, Pike, Carbon, Wayne, Bucks, and Philadelphia County when relevant.
- New Jersey: Union and Warren Counties; add other counties based on actual sale calendars and travel preferences.
- New York: Orange and Sullivan Counties.
- Add any other state/county when a live auction source and the legal sale process are confirmed.

## Initial acquisition criteria

- Property type: detached single-family home (do not confuse with condo, duplex, multifamily, vacant land, or commercial).
- Target purchase price: $100,000–$150,000; stretch research ceiling $200,000.
- Bedrooms: preferably 3+.
- Setting: quieter/small-town/rural residential; assess practical travel distance to family and services.
- Condition: move-in ready to moderate rehab preferred; major rehab requires contractor review.
- Budget test: bid/purchase price + buyer premium + closing costs + delinquent taxes/fees + title/legal costs + repairs + utilities/carrying costs + financing + contingency.
- Never equate an opening bid, Zestimate, Redfin Estimate, assessed value, or advertised “starting bid” with a verified market value or all-in acquisition cost.

## Sale-type decision guide

- **Tax lien / certificate:** generally buys a lien claim, not immediate ownership. Redemption and enforcement procedures vary.
- **Upset sale (Pennsylvania):** tax sale where liens/mortgages may survive. Do not bid without understanding the specific sale and title risks.
- **Judicial sale (Pennsylvania):** court-ordered sale; may have different lien-clearing effects, but exceptions and procedures matter. Obtain title/legal review.
- **Deed sale / tax deed:** may convey a deed or ownership interest, subject to the jurisdiction’s process, redemption rights, and title risks.
- **Mortgage foreclosure / sheriff sale:** lender-related foreclosure process; occupancy, liens, deposit, closing and confirmation rules must be reviewed.
- **REO / bank-owned:** lender-owned property after foreclosure; often more conventional than buying a tax lien, but condition and title still need review.
- **Redeemable deed:** redemption rights may delay possession or finality.
- **Continuation / adjourned sale:** a postponed sale; confirm the new date, current list and unchanged/updated terms.
- **Special commissioner sale:** a specific legal process; read the governing notice and sale terms.

## Suggested repository structure

```text
rolyfe-property-research-intelligence/
├── README.md
├── DESCRIPTION.md
├── PROPERTY_RESEARCH_WORKFLOW.md
├── SALE_TYPE_GLOSSARY.md
├── SOURCE_DIRECTORY.md
├── PROPERTY_INTAKE_TEMPLATE.md
├── UNDERWRITING_TEMPLATE.md
├── DUE_DILIGENCE_CHECKLIST.md
└── data/
    └── README.md
```

## Data and privacy rules

- Store source URLs, retrieval dates, parcel identifiers, and evidence notes.
- Separate verified facts, third-party estimates, assumptions, and unknowns.
- Do not commit passwords, API keys, private lender documents, personal IDs, bank statements, proof-of-funds letters, or nonpublic borrower information to a public repository.
- Keep sensitive deal documents in a private, access-controlled location.
- Use only authorized APIs and respect site terms; do not assume every site permits scraping or bulk export.
- Maintain outreach consent and suppression records before any campaign.

## Disclaimer

This repository supports research and preliminary analysis. It does not provide legal, tax, title, appraisal, engineering, lending, or investment advice. Verify all material facts with official records and qualified professionals. Auction rules, redemption periods, lien effects, and closing requirements vary by jurisdiction and sale type.

## Interactive property map (v1)

The browser-based Property Map uses Leaflet with an OpenStreetMap tile layer and allows a user to locate an individual saved property from its record card. It does not require a Google Maps JavaScript API key for this initial prototype.

- **User-initiated lookup only:** selecting **Locate on map** sends that record's street address to the public OpenStreetMap Nominatim search endpoint. The application does not run background lookups or address autocomplete, and requests are serialized with at least a 1.1-second interval.
- **Local coordinate storage:** a successful address match is stored with the property record in this browser. Coordinates are not shared between devices and the lookup does not verify a parcel boundary.
- **Google Maps shortcut:** each saved record with an address can open a Google Maps search page. That is a consumer map link, not a Google Maps API integration.
- **Accuracy boundary:** map pins are approximate address matches. Verify location and parcel boundaries against authoritative county/municipal GIS and property records.
- **Provider boundary:** the public OpenStreetMap tile service and public Nominatim instance have usage restrictions and no production availability guarantee. For wider commercial usage, select a provider whose contract and service limits fit the application, or operate a suitable self-hosted service. Keep attribution and the provider's terms in place when switching providers.

## Shared Property Research Dock

The reusable client-side component lives at shared/property-research-dock.js. It provides a consistent entry point across RO’Lyfe GitHub Pages sites for map navigation, listings/comps, auction and tax-sale portals, official property/tax research, parcel data, flood maps, funding routes, and closing documents. Related sites load it with this script tag:

    <script src="https://rolrichman.github.io/rolyfe-property-research-intelligence/shared/property-research-dock.js"></script>

The dock opens providers or address-targeted web searches; it does not scrape sites or claim to retrieve verified live listing, ownership, lien, tax, or comparable-sales data. Its optional recent-property selector reads the existing rolyfe_property_research_records_v1 browser-local storage key on the rolrichman.github.io origin. This works across pages on that origin in the same browser profile, but it does not sync devices or provide user authentication. Do not place sensitive borrower, tenant, owner, or financial information in these public static pages.

For consistent workflow design, use the sequence Find → Capture → Verify → Underwrite → Plan Capital → Close/Review, with source links and review dates attached to every material fact. See PROPERTY_RESEARCH_STANDARD.md for the shared workflow and field standard.
