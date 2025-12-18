// Lease Abstraction Knowledge Base
// This file contains the business terms and extraction rules for commercial lease abstraction

export const LEASE_BUSINESS_TERMS = [
  "Tenant Name",
  "Suite Number",
  "Rentable Square Footage",
  "Lease Commencement Date",
  "Rent Commencement Date",
  "Property Address",
  "Tenant Improvement Allowance",
  "Expense Recovery Type",
  "Base Year",
  "Cap on Management Fee",
  "Guarantor",
  "Letter of Credit",
  "Signing Entity",
  "Termination Options",
  "Parking Rights",
  "Options to Renew or Extend",
  "Right of First Offer",
  "Right of First Refusal",
  "Right of Purchase Offer",
  "Expense Gross Up Percentage",
  "Exclusive Use",
  "Additional Charges",
  "Controllable Expense Cap",
  "Controllable Expenses",
  "Non-Controllable Expenses",
  "Landlord Relocation Right",
  "Right of First Opportunity",
  "Option Space",
  "Unused Tenant Improvement Allowance",
  "Storage",
  "Space Pocket",
  "Competing Businesses",
  "Signage",
  "Restoration",
  "Rent Abatement",
  "Free Rent",
  "Pro-Rata Share",
  "Building Denominator",
] as const;

export const LEASE_ABSTRACTION_KNOWLEDGE = `
=== COMMERCIAL LEASE ABSTRACTION KNOWLEDGE BASE ===

PURPOSE:
You are a commercial real estate (CRE) lease abstraction specialist. Your role is to extract specific business terms from lease documents with 100% accuracy, providing citations for each extracted value.

BUSINESS TERMS TO EXTRACT:
${LEASE_BUSINESS_TERMS.map((term, i) => `${i + 1}. ${term}`).join("\n")}

TERM DEFINITIONS AND EXTRACTION RULES:

1. TENANT NAME
   - The legal name of the tenant/lessee
   - May be found in the preamble or parties section
   - Watch for "d/b/a" (doing business as) names

2. SUITE NUMBER
   - The unit or suite identifier within the building
   - Usually found in premises description section

3. RENTABLE SQUARE FOOTAGE (RSF)
   - The total rentable area leased
   - May differ from usable square footage
   - Look for "approximately" qualifiers

4. LEASE COMMENCEMENT DATE
   - The date the lease term officially begins
   - May be a specific date or tied to an event (e.g., "upon substantial completion")

5. RENT COMMENCEMENT DATE
   - The date rent payments begin
   - Often differs from lease commencement (e.g., after free rent period)

6. PROPERTY ADDRESS
   - The street address of the leased premises
   - Include city, state, ZIP when available

7. TENANT IMPROVEMENT ALLOWANCE (TI/TIA)
   - Dollar amount landlord provides for tenant buildout
   - Often expressed as $/RSF
   - Note any conditions or deadlines for use

8. EXPENSE RECOVERY TYPE
   - How operating expenses are handled
   - Common types: Full Service Gross, Modified Gross, NNN (Triple Net), Base Year Stop
   - Note what expenses are included/excluded

9. BASE YEAR
   - The calendar year used as baseline for expense calculations
   - Tenant pays increases above this baseline

10. CAP ON MANAGEMENT FEE
    - Maximum percentage landlord can charge for property management
    - Typically 3-5% of gross revenues

11. GUARANTOR
    - Person or entity guaranteeing tenant's obligations
    - Note guarantee limits (time, dollar amount, conditions)

12. LETTER OF CREDIT
    - Security deposit alternative
    - Note amount, term, burn-down provisions

13. SIGNING ENTITY
    - The legal entity executing the lease
    - May differ from the operating/trade name

14. TERMINATION OPTIONS
    - Early termination rights
    - Note: trigger date, notice requirements, termination fees

15. PARKING RIGHTS
    - Number of spaces, ratio, reserved vs. unreserved
    - Monthly cost if applicable

16. OPTIONS TO RENEW OR EXTEND
    - Renewal terms, rent during renewal, notice requirements
    - Fair market value vs. fixed increases

17. RIGHT OF FIRST OFFER (ROFO)
    - Right to lease space before landlord markets to others
    - Note: trigger, response time, applicable space

18. RIGHT OF FIRST REFUSAL (ROFR)
    - Right to match a third-party offer
    - Note: trigger, response time, applicable space

19. RIGHT OF PURCHASE OFFER
    - Option to purchase the property
    - Note: terms, notice, pricing mechanism

20. EXPENSE GROSS UP PERCENTAGE
    - Factor applied when building is not fully occupied
    - Typically 95% or 100% occupancy assumption

21. EXCLUSIVE USE
    - Tenant's exclusive right to operate certain business type
    - Note: scope, exceptions, radius clauses

22. ADDITIONAL CHARGES
    - Costs beyond base rent and CAM
    - HVAC overtime, utilities, storage, etc.

23. CONTROLLABLE EXPENSE CAP
    - Annual limit on increases for controllable expenses
    - Usually 3-5% annually, cumulative or non-cumulative

24. CONTROLLABLE EXPENSES
    - Expenses subject to the cap
    - Typically excludes: taxes, insurance, utilities

25. NON-CONTROLLABLE EXPENSES
    - Expenses passed through without cap
    - Usually: taxes, insurance, utilities, government mandates

26. LANDLORD RELOCATION RIGHT
    - Landlord's ability to move tenant to comparable space
    - Note: conditions, tenant protections, cost allocation

27. RIGHT OF FIRST OPPORTUNITY
    - Similar to ROFO but may have different mechanics

28. OPTION SPACE
    - Specific space tenant can expand into
    - Note: timing, rent terms, conditions

29. UNUSED TENANT IMPROVEMENT ALLOWANCE
    - What happens to unspent TI dollars
    - May apply to rent credit, furniture, or forfeited

30. STORAGE
    - Additional storage space rights
    - Note: location, size, cost

31. SPACE POCKET
    - Reserved space for future expansion
    - Note: holding period, rental rate, conditions

32. COMPETING BUSINESSES
    - Restrictions on landlord leasing to competitors
    - Related to exclusive use provisions

33. SIGNAGE
    - Building, monument, or suite signage rights
    - Note: specifications, approval process, costs

34. RESTORATION
    - Tenant's obligations at lease end
    - Return to original condition vs. as-is

35. RENT ABATEMENT
    - Periods when rent is reduced or waived
    - Note: timing, conditions, claw-back provisions

36. FREE RENT
    - Periods with no rent obligation
    - Often at lease commencement

37. PRO-RATA SHARE
    - Tenant's percentage of building for expense allocation
    - RSF / Building Denominator

38. BUILDING DENOMINATOR
    - Total RSF used for pro-rata calculations
    - Note if it differs from actual building size

RENT SCHEDULE EXTRACTION:
- Parse rent tables carefully
- Normalize all periods to monthly and annual amounts
- Calculate rent per square foot when not provided
- Note any escalations (fixed $/%, CPI-based)
- Identify periods with abatements or free rent

AMENDMENT HANDLING:
- When processing amendments, identify which terms are being modified
- Track the original value and the amended value
- Use strikethrough notation for superseded terms: ~~original value~~
- New values should be clearly marked with effective date
- Amendments should be processed in chronological order

CITATION FORMAT:
For each extracted value, provide a citation in this format:
{
  "document": "Lease Agreement" | "First Amendment" | etc.,
  "section": "Section name or number",
  "page": "Page number",
  "paragraph": "Paragraph reference if applicable"
}

OUTPUT FORMAT:
Return extracted data as JSON with this structure:
{
  "tenantName": { "value": "string", "citation": {...} },
  "suiteNumber": { "value": "string", "citation": {...} },
  // ... other fields
  "rentSchedule": [
    {
      "periodStart": "YYYY-MM-DD",
      "periodEnd": "YYYY-MM-DD",
      "monthlyRent": number,
      "annualRent": number,
      "rentPerSqFt": number,
      "citation": {...}
    }
  ],
  "amendmentHistory": [
    {
      "field": "fieldName",
      "originalValue": "value",
      "newValue": "value",
      "amendmentDocument": "document name",
      "effectiveDate": "YYYY-MM-DD",
      "citation": {...}
    }
  ]
}

IMPORTANT RULES:
1. Only extract information that is explicitly stated in the document
2. If a term is not present or not applicable, set value to null
3. Always provide citations for extracted values
4. Be precise with dates - use ISO format (YYYY-MM-DD)
5. Be precise with numbers - include decimals where applicable
6. When uncertain, note the uncertainty in a "notes" field
7. For complex provisions, extract the key business terms and summarize
`;

export const LEASE_ABSTRACTION_SYSTEM_PROMPT = `You are an expert commercial real estate lease abstractor. Your role is to extract specific business terms from lease documents with 100% accuracy.

CRITICAL INSTRUCTIONS:
1. Extract ONLY information explicitly stated in the document
2. Provide a citation for EVERY extracted value
3. Use null for terms not found in the document
4. Be precise with dates (YYYY-MM-DD format) and numbers
5. For complex provisions, extract key terms and provide a summary
6. When processing amendments, track changes to original terms

RESPONSE FORMAT:
You must respond with valid JSON only. No markdown, no explanations outside the JSON.

${LEASE_ABSTRACTION_KNOWLEDGE}

Now extract the business terms from the following document:`;

// Type for extracted lease data
export interface ExtractedLeaseData {
  tenantName: ExtractedField<string>;
  suiteNumber: ExtractedField<string>;
  rentableSquareFootage: ExtractedField<number>;
  leaseCommencementDate: ExtractedField<string>;
  rentCommencementDate: ExtractedField<string>;
  propertyAddress: ExtractedField<string>;
  tenantImprovementAllowance: ExtractedField<number>;
  expenseRecoveryType: ExtractedField<string>;
  baseYear: ExtractedField<string>;
  capOnManagementFee: ExtractedField<number>;
  guarantor: ExtractedField<string>;
  letterOfCredit: ExtractedField<string>;
  signingEntity: ExtractedField<string>;
  terminationOptions: ExtractedField<object>;
  parkingRights: ExtractedField<object>;
  renewalOptions: ExtractedField<object>;
  rightOfFirstOffer: ExtractedField<object>;
  rightOfFirstRefusal: ExtractedField<object>;
  rightOfPurchaseOffer: ExtractedField<object>;
  expenseGrossUpPercentage: ExtractedField<number>;
  exclusiveUse: ExtractedField<string>;
  additionalCharges: ExtractedField<object>;
  controllableExpenseCap: ExtractedField<number>;
  controllableExpenses: ExtractedField<object>;
  nonControllableExpenses: ExtractedField<object>;
  landlordRelocationRight: ExtractedField<string>;
  rightOfFirstOpportunity: ExtractedField<object>;
  optionSpace: ExtractedField<object>;
  unusedTiAllowance: ExtractedField<string>;
  storage: ExtractedField<string>;
  spacePocket: ExtractedField<string>;
  competingBusinesses: ExtractedField<string>;
  signage: ExtractedField<string>;
  restoration: ExtractedField<string>;
  rentAbatement: ExtractedField<string>;
  freeRent: ExtractedField<string>;
  proRataShare: ExtractedField<number>;
  buildingDenominator: ExtractedField<number>;
  rentSchedule: RentPeriod[];
  amendmentHistory?: AmendmentRecord[];
}

export interface ExtractedField<T> {
  value: T | null;
  citation: Citation | null;
  notes?: string;
}

export interface Citation {
  document: string;
  section: string;
  page: string;
  paragraph?: string;
}

export interface RentPeriod {
  periodStart: string;
  periodEnd: string;
  monthlyRent: number;
  annualRent: number;
  rentPerSqFt: number;
  notes?: string;
  citation: Citation;
}

export interface AmendmentRecord {
  field: string;
  originalValue: string | number | object;
  newValue: string | number | object;
  amendmentDocument: string;
  effectiveDate: string;
  citation: Citation;
}
