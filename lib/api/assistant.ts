import { apiFetch } from './client';
import { AssistantStateSchema, type AssistantStateDTO } from '@/lib/schemas/dto';

// ============================================================================
// TYPES
// ============================================================================

export type { AssistantStateDTO };

export type AssistantCommandType =
  | 'start_inventory'
  | 'add_product'
  | 'finish_inventory'
  | 'create_recipe'
  | 'finish_recipes'
  | 'create_dish'
  | 'finish_dishes'
  | 'view_report';

export interface AssistantCommand {
  type: AssistantCommandType;
  payload?: Record<string, unknown>;
}

// ============================================================================
// API FUNCTIONS
// ============================================================================

/**
 * GET /api/assistant/state
 * Returns current bot state, available actions and warnings.
 */
export async function getAssistantState(
  accessToken: string
): Promise<AssistantStateDTO | null> {
  try {
    const raw = await apiFetch<unknown>('/api/assistant/state', {}, accessToken);
    if (!raw) return null;
    return AssistantStateSchema.parse(raw);
  } catch {
    return null;
  }
}

/**
 * POST /api/assistant/command
 * Send a command to the state machine bot.
 * Returns updated state (same shape as GET /api/assistant/state).
 */
export async function sendAssistantCommand(
  command: AssistantCommand,
  accessToken: string
): Promise<AssistantStateDTO | null> {
  try {
    const raw = await apiFetch<unknown>('/api/assistant/command', {
      method: 'POST',
      body: JSON.stringify({ command }),
    }, accessToken);
    if (!raw) return null;
    return AssistantStateSchema.parse(raw);
  } catch {
    return null;
  }
}
