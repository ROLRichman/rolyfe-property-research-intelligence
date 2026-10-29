# RO’Lyfe Shared Property Research Standard

## Purpose

Use one research design across RO’Lyfe Property Research Intelligence, Auction Capital Machine, Funding & Capital, Relocation Intelligence, the Command Hub, and the Contract Documents Hub. The canonical workspace owns the research flow; the other apps provide specialist tools and link back to the same workflow.

## Shared workflow

1. **Find** — search listings, off-market leads, tax sales, sheriff/foreclosure auctions, public surplus property, and investor lead sources.
2. **Capture** — save a normalized lead with the exact address or legal parcel identifier, source URL, date captured, jurisdiction, and sale deadline.
3. **Verify** — check official county/municipal assessor, recorder, tax collector, court/sheriff sale notice, parcel GIS, zoning/use, flood map, occupancy/access, and title/legal process. Keep conflicting facts visible.
4. **Underwrite** — retain dated comparable sales, ARV rationale and confidence, purchase/bid, rehab scope, contingency, financing costs, taxes, transfer/auction fees, holding costs, selling costs, target profit, and maximum-offer estimate.
5. **Plan capital** — identify cash-to-close, lender/partner fit, timing, borrower requirements, and alternative capital route. Referral/brokerage activity is not loan approval; lender and partner decisions control.
6. **Close and review** — store documents and decision notes, record the final outcome, update assumptions, and preserve a traceable source trail.

## Shared lead data fields

- id: stable lead identifier
- address, parcel_id, county, state, postal_code, property_type, legal_use
- lead_type: off-market, MLS/listing, tax sale, tax lien/certificate, tax deed, sheriff sale, foreclosure/REO, bank-owned, government surplus, vacant land, or other
- source_url, source_name, captured_at, last_verified_at
- sale_date, deposit_deadline, terms_url, official_status
- latitude, longitude, coordinate_source, coordinate_checked_at
- facts_verified, facts_unverified, discrepancies, open_questions
- comps, arv_estimate, arv_confidence, rehab_estimate, contingency
- purchase_or_bid, closing_and_auction_costs, holding_costs, financing_costs, tax_and_lien_exposure, selling_costs
- target_profit, maximum_offer, capital_route, cash_to_close, exit_strategy, risk_flags, decision_status

## Evidence and status rules

- Mark each material value as **verified**, **estimated**, **conflicting**, or **unknown**.
- A listing price, AVM, or assessed value is not automatically market value or ARV.
- Address geocoding is not legal parcel geometry. Confirm a pin against official GIS/parcel records.
- Tax lien, tax certificate, tax deed, sheriff sale, and mortgage foreclosure are different legal/financial processes. Verify jurisdiction-specific terms, priority, redemption, occupancy, possession, and title.
- Treat third-party sources as discovery sources; primary public records and governing sale documents control.
- A web link in the dock opens a provider or search. It does not mean RO’Lyfe has API access or has imported verified results.

## Storage and integration

The current static research page stores property records in local browser storage under rolyfe_property_research_records_v1. Pages under https://rolrichman.github.io/ can read the same origin-local data in the same browser profile, but data is not shared across users/devices. This is a prototype convenience, not a multi-user CRM or durable shared database.

A future cross-device system should use authenticated Supabase access with per-user or team ownership, row-level security, auditable source records, server-side integrations, and server-side secrets. Do not put privileged database keys, API credentials, full borrower financial details, or personal identifiers into public HTML/JavaScript. Add paid APIs only after price, usage, legal, and billing review.
