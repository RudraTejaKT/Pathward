# Backlox Career Guide — India Career Universe Upgrade

Implemented in this package:

- Expanded Class 12 pathways for Science, Commerce, Arts/Humanities and Vocational/Skill routes.
- Added a broad India-wide career-family catalogue covering engineering, medical/health, pharmacy, dentistry, AYUSH, veterinary, agriculture, pure science, commerce/management, law, design, architecture/planning, computer applications, humanities/social sciences, education, hospitality/aviation, defence/public service, maritime, sports and more.
- Added an After-MBBS / Medical PG catalogue covering MD, MS, DNB, DM, MCh, DrNB, fellowships, public health, research, administration, education and major clinical/non-clinical specialties.
- Added stream-specific learning modules and a pathway API.
- Expanded competitive-exam catalogue with national, state and specialist entrance routes.
- MCQ Lab now supports selectable batches up to 500 questions per generation and has no daily question quota in the application logic; users can generate new batches repeatedly.
- Instructor Studio now lets instructors tag courses to a Class 12 stream and add as many modules as required.
- Existing TED Talk vocabulary section and course marketplace remain available.

Important:
- "Unlimited" here means no daily usage quota is enforced by this application. A production deployment should still add infrastructure/rate limits and an actual question-generation/content bank for scale.
- The career catalogue is designed as an extensible India-wide taxonomy rather than a legal claim that every programme offered by every institution is represented. New courses/exams can be added to `backend/routes/learning.js` without changing the frontend API.
