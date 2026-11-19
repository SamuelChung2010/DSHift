/**
 * Host half of the DeepSeek Chat mode bundle. It registers the owner-only
 * HTTP routes the Client half uses; all DeepSeek traffic stays on the Host.
 */

import { ChatService } from './lib/service.js'

export const inject = ['connection']

export function apply(ctx, config) {
  const service = new ChatService(ctx, config)
  ctx.effect(() => {
    service.registerRoutes()
    return () => service.dispose()
  }, 'deepseek-chat-mode: routes and streams')
}
