import { Effect } from "effect"
import { redirect } from "react-router"
import type { Route } from "./+types/go.$code"
import { db } from "../infra/db.server.js"
import { buildLinkRepository } from "../infra/repo.server.js"
import { makeLinksQuery } from "../core/queries/links.js"

export async function loader({ params }: Route.LoaderArgs) {
  const { code } = params
  const repo = buildLinkRepository(db)
  const query = makeLinksQuery(repo)

  const result = await Effect.runPromise(
    query.resolveAndTrack(code).pipe(
      Effect.map((url) => redirect(url, 302)),
      Effect.catchTag("LinkNotFoundError", () =>
        Effect.succeed(
          new Response("Short link not found", { status: 404 }),
        ),
      ),
    ),
  )

  return result
}
