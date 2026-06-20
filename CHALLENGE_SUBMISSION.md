# Submission

## What I Did

I first tried to start the project locally in order to consider the current status and evaluate the current status.
The project had a few not covered corner case, and a not-so-correct implementation of the shortening algorithm, also the
docker compose was not working.

Conscious of the requirements, I decided to use the skill /superpowers with claude code.
I cooperated with the AI to decide step by step which was the direction we had to follow, and a superpowers plan of
about 20 tasks was the ouput of this very first step.

The goal was to keep every change in the code as small as possible and commit it as soon as it was validated by a
human (me).

The idea has been to continue segregating the domain logic in the engine package, and follow hexagonal architecture
principles to achieve a great base from which the project could evolve in the future, so that the engine package is
framework agnostic.

The code generation algorithm was flawed, it would have reached collision after just 9 link entries, because of that, it
has been substituted by a 7 chars one, generated using 62 symbols, this enables 3.521.614.606.208 combinations.

The codes are now stored in postgres, which is initialized via prisma migrations, a dedicated clicks table hosts the
statistics of the clicks.

The frontend is built using shadcnui and tailwind, in general the UI is less catchy but it's very clear in its purpose,
it also shows history statistics with copy buttons.

The app is now more secure, with strict URL validation, length cap, no private hosts, and ip-rate limiting.

App can be used "in production mode" at localhost:3000 by running `docker compose up --build`, migrations are run
automatically.

## What I Would Do With More Time

On UX side I see a few problems:

Links are limited to http:// or https:// not wrong per-se but limiting the usage of the app to "power-users", this could
be solved by simply adding some kind of mask, similarly to the country prefixes for mobile phone input forms.

The statistics need the user to refresh the page to change, It would make sense to use some polling to keep them
updated.

IP range limitation is good, but it's not that precise when the app scale horizontally, using redis as a centralized
source of truth for keeping track of the ips, eventually it could also make sense to delegate this responsibility to
something like haproxy, cloudflare, or cloudfront, depending.

## AI Usage

I used the skill /superpowers, commanding AI to do the task as it was me, it was also specified to keep tasks small and
stop after each one in order to allow me to manually review it and commit it.
I feel this is the perfect balance between reproducibility, speed of execution and correctness of the code.

## Feedback

The challenge was clear and fun, 2 hours is the sweet spot to challenge the candidate, I feel It's barely enough to do
everything, forcing the candidate to take compromises. 
