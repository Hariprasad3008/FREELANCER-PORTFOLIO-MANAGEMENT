// src/lib/conversationHelpers.js
import { supabase } from "./supabaseClient";
import {
  cacheConversationPair,
  clearCachedConversation,
  getCachedConversationId,
} from "./conversationCache";

/**
 * Finds an existing conversation between two users or creates a fresh one.
 * Returns the conversation id so callers can redirect to /messages?c=<id>.
 */
export async function ensureConversation(
  currentUserId,
  targetUserId,
  targetProfile = {}
) {
  if (!currentUserId || !targetUserId) {
    throw new Error("Both users are required to start a conversation.");
  }

  if (currentUserId === targetUserId) {
    throw new Error("You can't start a conversation with yourself.");
  }

  const cachedConversationId = getCachedConversationId(
    currentUserId,
    targetUserId
  );

  if (cachedConversationId) {
    const { data: membership, error: membershipCheckError } = await supabase
      .from("conversation_participants")
      .select("conversation_id")
      .eq("conversation_id", cachedConversationId)
      .eq("user_id", currentUserId)
      .maybeSingle();

    if (!membershipCheckError && membership) {
      return cachedConversationId;
    }

    clearCachedConversation(currentUserId, targetUserId, cachedConversationId);
  }

  // Fetch conversations current user participates in
  const { data: myMemberships, error: membershipError } = await supabase
    .from("conversation_participants")
    .select("conversation_id")
    .eq("user_id", currentUserId);

  if (membershipError) {
    throw membershipError;
  }

  const myConversationIds = myMemberships.map((row) => row.conversation_id);

  if (myConversationIds.length > 0) {
    const { data: existing, error: existingError } = await supabase
      .from("conversation_participants")
      .select("conversation_id")
      .in("conversation_id", myConversationIds)
      .eq("user_id", targetUserId)
      .limit(1);

    if (existingError) {
      throw existingError;
    }

    if (existing && existing.length > 0) {
      cacheConversationPair(
        currentUserId,
        targetUserId,
        existing[0].conversation_id,
        targetProfile
      );
      return existing[0].conversation_id;
    }
  }

  const { data: newConversation, error: newConversationError } = await supabase
    .from("conversations")
    .insert({})
    .select("id")
    .single();

  if (newConversationError) {
    throw newConversationError;
  }

  const { error: participantsError } = await supabase
    .from("conversation_participants")
    .insert([
      { conversation_id: newConversation.id, user_id: currentUserId },
      { conversation_id: newConversation.id, user_id: targetUserId },
    ]);

  if (participantsError) {
    throw participantsError;
  }

  cacheConversationPair(
    currentUserId,
    targetUserId,
    newConversation.id,
    targetProfile
  );

  return newConversation.id;
}

