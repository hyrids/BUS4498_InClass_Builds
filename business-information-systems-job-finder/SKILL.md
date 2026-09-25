---
name: "business-information-systems-job-finder"
description: "Find and organize relevant job opportunities for Business Information Systems majors based on their skills, experience, location, and career interests. Use when the user asks for job recommendations, career options, job titles, or help matching their background to business and technology roles."
---

# business-information-systems-job-finder

## User inputs
The user supplies: their skills (technical and business, e.g. SQL, ERP systems, data analysis, process modeling), relevant coursework or certifications, work/internship experience, preferred location(s) or remote preference, and career interests (e.g. business analyst, systems analyst, IT project management, data/BI roles). Ask for skills and location before searching if either is missing — both materially change the results. Treat an unspecified career interest as "open," and search broadly across common Business Information Systems (BIS) career paths instead of asking.

## Procedure
## Procedure
1. Read the supplied skills, experience, location, and interests.
2. Consult `bis-role-map.md` to translate the user's skills and coursework into likely BIS job titles (e.g. "SQL + process mapping" → Business Systems Analyst, ERP Analyst). If the user's background doesn't clearly map to any listed title, ask them to confirm or pick from close matches rather than guessing.
3. Use `job_search.py` to query job postings matching the mapped titles, location, and any stated remote preference. Re-run with broadened title or location terms if the first pass returns too few results.
4. Score and rank returned postings against the user's stated skills and experience using the criteria in `ranking-guide.md`, and drop postings missing a title, location, or link.
5. Group the ranked results by role type (e.g. Analyst roles, IT/PM roles, Data/BI roles) and flag any postings with deadlines in the next 7 days.
6. Fill `results-template.md` with the grouped, ranked postings and return it.

## Output
Return a short report with: role-type groupings, each containing job title, company, location, and link; a one-line fit rationale per posting tied to the user's stated skills; postings with near-term deadlines flagged at the top; and a short list of any skills gaps noticed (skills common in postings but not in the user's input).

## Boundaries
Do not invent job postings, companies, or links — only return postings actually retrieved via search. Do not apply to jobs, submit forms, or contact recruiters on the user's behalf. If the user's skills don't match any BIS-adjacent role well, say so rather than forcing a fit, and ask whether to broaden the search criteria.
