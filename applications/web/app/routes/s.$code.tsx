import { redirect } from 'react-router';
import type { Route } from './+types/s.$code';
import { recordClick, NotFoundError } from '@url-shortener/engine';

export async function loader({ params }: Route.LoaderArgs) {
  const { code } = params;

  try {
    const shortUrl = await recordClick(code);
    return redirect(shortUrl.originalUrl, 302);
  } catch (err) {
    if (err instanceof NotFoundError) {
      throw new Response('Not Found', { status: 404 });
    }
    throw err;
  }
}
