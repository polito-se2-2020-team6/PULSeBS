TEMPLATE FOR RETROSPECTIVE (add your team name)
=====================================

The retrospective should include _at least_ the following
sections:

- [process measures](#process-measures)
- [quality measures](#quality-measures)
- [general assessment](#assessment)

## PROCESS MEASURES 

### Macro statistics

- Number of stories committed vs done : 8/6
- Total points committed vs done: 29/16
- Nr of hours planned vs spent (as a team): 70/66:30

**Remember**  a story is done ONLY if it fits the Definition of Done:
 
- Unit Tests passing: 33
- Code review completed: 6
- Code present on VCS: 2.7k LOC
- End-to-End tests performed: 4

> Please refine your DoD 

### Detailed statistics

| Story | # Tasks | Points | Hours est. | Hours actual |
| ----- | ------- | ------ | ---------- | ------------ |
| _#0_  | 4       | -      | 34         | 25           |
| _#2_  | 3       | 3      | 1          | 1            |
| _#4_  | 3       | 2      | 1          | 1            |
| _#7_  | 4       | 3      | 4          | 3:40         |
| _#8_  | 3       | 2      | 0:40       | 0:45         |
| _#9_  | 4       | 3      | 3:30       | 2:40         |
| _#10_ | 5       | 5      | 10:05      | 14:30        |
| _#11_ | 4       | 8      | 5          | 6:20         |
| _#13_ | 4       | 3      | 6:30       | 6:20         |
   

- Hours per task (average, standard deviation): 6:50 (avg), 8:06 (stdev)

- Total task estimation error ratio: sum of total hours estimation / sum of total hours spent from previous table: 1.05

  
## QUALITY MEASURES 

- Unit Testing:
  - Total hours estimated: 4:10
  - Total hours spent: 1:55
  - Nr of automated unit test cases 
  - Coverage (if available)
- E2E testing:
  - Total hours estimated: 2
  - Total hours spent: 1
- Code review 
  - Total hours estimated: 1:30
  - Total hours spent: 0:55
- Technical Debt management:
  - Total hours estimated: 16
  - Total hours spent: 4:55
  - Hours estimated for remediation by SonarCloud: 8
  - Hours spent on remediation: ? (non measured, but included in total hours spent)
  - debt ratio (as reported by SonarCloud under "Measures-Maintainability"): 0.8%
  - rating for each quality characteristic reported in SonarCloud under "Measures" (namely reliability, security, maintainability )
    - Reliability: C
    - Security: A
    - Maintainability: A
  


## ASSESSMENT

- What caused your errors in estimation (if any)?
  - We spent lots of time on studying new technologies (docker and E2E automated tests).

- What lessons did you learn (both positive and negative) in this sprint?
  - We need to have regular scrum meetings in order to coordinate better the work.
  - Better organize the time spent on tasks, and be able to finish the work assigned in advance to properly prepare for the demo.

- Which improvement goals set in the previous retrospective were you able to achieve?
  - We were able to automate part of the E2E tests.
  
- Which ones you were not able to achieve? Why?
  - We still need to improve our skills at time management, due to a lack of communication.

- Improvement goals for the next sprint and how to achieve them (technical tasks, team coordination, etc.)
  - Better organize branches on github (one branch for each story, with sub branches for each sub task, rather then one branch for frontend and one for backend).
  - Improve our skill at time management.

- One thing you are proud of as a Team!!
  - Despite all the bad things that happened in this spring, at least we are honest with ourselves.