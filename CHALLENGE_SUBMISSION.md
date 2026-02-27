# Submission

## What I Did

<!-- Briefly describe what you implemented or improved. What did you prioritize and why? -->
First of all, let's fix the ugly UI. Then let's focus on implementing core functionalities. Finally, let's do some refactor and testing.

This is the list of implemented changes, chronologically ordered:

- Frontend: improving UI, adding url validation
- Backend: implementing url persistence using Prisma
- Backend: implementing url click logs
- Frontend: adding error message details
- Frontend: create page with existing urls list
- Frontend: refactor using Radix UI components
- Backend: manual refactor of functions created by AI
- Testing: manual testing that the app works correctly
- Deployment: updated Dockerfile to make it work with Prisma

## What I Would Do With More Time

<!-- What would you tackle next if you had more time? -->
- Adding the option to customize short codes
- Delete created urls from the stats page
- Edit original urls keeping the same short code
- Improve tracking: adding tracking referrer, user agent, location...
- Limit who can access the stats page
- Adding url expiration date
- Adding rate limit and ddos protection
- Caching frequently accessed urls

## AI Usage

<!-- How did you use AI tools (if any)? Include some example prompts if you used any agent. -->
I used Claude Code. This is the list of used prompts:
```
improve the interface, make a clean, modern ui with consistent styling

implement url validation with error feedback

add shortenedUrls persistence using Prisma

log number of clicks if the shortened url exists

Failed to create shortened URL: Invalid `prisma.shortenedUrl.findFirst()` invocation: Error querying the database: Error code 14: Unable to open the database file

create a new page that shows a table of the current shortened urls with statistics

show created hour. show last update (that would be last click datetime)

replace html elements by Radix UI reusable components
```

I also used Claude Code to fix Dockerfile for Prisma functionality, as I found many errors while accessing the database file.

## Feedback

<!-- Any feedback on the challenge? Was it clear? Too easy/hard? Suggestions? -->
