TEMPLATE FOR RETROSPECTIVE (add your team name)
=====================================

The retrospective should include _at least_ the following
sections:

- [process measures](#process-measures)
- [quality measures](#quality-measures)
- [general assessment](#assessment)

## PROCESS MEASURES 

### Macro statistics

- Number of stories committed vs done: 8/4
- Total points committed vs done: 34/24
- Nr of hours planned vs spent (as a team): 53.5/72.5

**Remember**  a story is done ONLY if it fits the Definition of Done:
 
- Unit Tests passing: 9
- Code review completed: 18
- Code present on VCS: 
- End-to-End tests performed: 0

### Detailed statistics

| Story | # Tasks | Points | Hours est. | Hours actual |
| ----- | ------- | ------ | ---------- | ------------ |
| _#0_  | 6       | -      | 27         | 28           |
| _#1_  | 3       | 5      | 5          | 11           |
| _#2_  | 1       | 3      | 0.5        | 0            |
| _#3_  | 3       | 3      | 7          | 9.8          |
| _#4_  | 1       | 2      | 0.5        | 0.5          |
| _#5_  | 2       | 3      | 2.5        | 1.7          |
| _#6_  | 3       | 13     | 7          | 11           |
| _#7_  | 2       | 3      | 3          | 1.3          |
| _#8_  | 1       | 2      | 0.5        | 0            |

- Hours per task (average, standard deviation): 7.03h (avg), 8.70h (std deviation) 

- Total task estimation error ratio: sum of total hours estimation / sum of total hours spent from previous table: 0.74

  
## QUALITY MEASURES 

- Unit Testing:
  - Total hours estimated: N/A 
  - Total hours spent: 4h
  - Nr of automated unit test cases: 20
  - Coverage (if available)
- E2E testing:
  - Total hours estimated: N/A
  - Total hours spent: 5h
- Code review 
  - Total hours estimated: N/A
  - Total hours spent: 40m
- Technical Debt management:
  - Total hours estimated: N/A
  - Total hours spent: 1h
  - Hours estimated for remediation by SonarCloud: N/A
  - Hours spent on remediation: 30m
  - debt ratio (as reported by SonarQube under "Measures-Maintainability"): 1.7%
  - rating for each quality characteristic reported in SonarQube under "Measures" (namely reliability, security, maintainability )
    - Reliability: A
    - Security: A
    - Maintainability: A
  


## ASSESSMENT

- What caused your errors in estimation (if any)?
  - We underestimated the cost to be allocated to new technologies.

- What lessons did you learn (both positive and negative) in this sprint?
  - Time management is critical, expecially when you  are learning something new.

- Which improvement goals set in the previous retrospective were you able to achieve?
  - We improved our work by starting using different branches on GitHub.
  - We improved the way of communication and collaboration between each other.
  
- Which ones you were not able to achieve? Why?

- Improvement goals for the next sprint and how to achieve them (technical tasks, team coordination, etc.)
  - Improve the testing performed on the application.
  - Improve our skill at time management.

- One thing you are proud of as a Team!!
  - We worked well as a team, we are organized.
