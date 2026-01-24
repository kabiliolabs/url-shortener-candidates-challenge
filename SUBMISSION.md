# Submission

## What I Did

Continuing with the project stack, I kept the monorepo and React Router as a full-stack project (SSR) and took some time to understand how the existing codebase was structured.

Then, after doing some tests in the app and studying a little bit one URL shortener (https://tinyurl.com/) I focused the following:

- Split the app clearly into `server/` (loaders/actions/services) and `ui/` (components/pages), to make responsibilities obvious.
- Extracted logic into a small domain package (`libs/url-shortener` instead of `libs/engine`) to keep business logic out of route files.
- Added Prisma + SQLite (NoSQL for easier testing) so data survives restarts.
- Implemented a repository pattern to store shortened URLs and also register clicks.
- As I have some extra time, I did a few research of Radix and implemented it to built reusable UI components (`Button`, `Input`, `Card`, etc.) and improved the styling (inspired by the TinyURL site).
- Added basic validation and anti-abuse measures (URL validation, input limits, debounce with a delay a of a few seconds after clicking).

## What I Would Do With More Time

- Add tests (unit tests for the library and some integration tests for the flows).
- Improve server-side error handling.
- Store and use IP/User-Agent metadata (I already added the DB columns) to better understand usage patterns and support abuse prevention.
- Build a richer analytics page.
- Add stronger abuse prevention (for example rate limiting per IP, CAPTCHA).
- Improve UX around errors and edge cases.

## AI Usage

I used AI as a productivity tool throughout the challenge:

- At the beginning, to understand the existing project structure and get up to speed with React Router full-stack concepts (loaders/actions, routing, SSR setup) with ChatGPT and Cursor in ask mode.

> **Prompt Example:** can you show me how  this project is structured and what are the entry point components? Also I would like to have a list of actions of the app

- Using Cursor + Opus 4.5 (agent), to refactor the folder structure and automatically update imports/references after moving files.

  > **Prompt Example:** can you help me splitting app into `ui/` and `server/` inside app, and reorganizing the shared domain package into `logic/`, `models/`, and `repositories/`. Also I would verify that the imports and references are still working with the new structure 

- To do the Prisma setup: adding the relevant CLI scripts to `package.json`, and generating an initial `schema.prisma` based on the tables I wanted.

  > **Prompt Example:** can you install me Prisma in the server part of the project and create me the initial schema based on this tables (tables and columns)


- After I ran Prisma migrations and verified the DB worked, I asked the AI to help with the models and scaffolding of the repositories.
  
  > **Prompt Example:** can you create me the models for the new schemas and a scaffold of the repository (using repository patter). 


- For the UI work, I used AI to help install Radix and create the reusable components, and to replace the initial UI with the new component-based UI.


  > **Prompt Example:** can you we add radix UI for the FE part to create reusable components? I would like to base on this (image of home page of tinyurl) for the style of the components. 

- Finally, I used AI to help implement basic validation and anti-abuse measures (URL validation, input limits, and debounced submissions).

  > **Prompt Example:** Can you help me adding the following validations to the app? 1 Valid http urls 2 add some limit to the string inputs and 3 adding a debounce to avoid multiple calls

## Feedback

I really enjoyed this exercise. Given the short time limit, it pushed me to prioritize and focus on the most important improvements, which felt realistic.

It was also a nice opportunity to work with tools I don't use every day, like React Router in full-stack mode (which reminded me a bit of Next.js) and Radix for reusable UI components.

Overall, I liked that I could approach the challenge similarly to real day-to-day work, including using AI to speed up refactors and boilerplate while keeping the core decisions and implementation under my control.
