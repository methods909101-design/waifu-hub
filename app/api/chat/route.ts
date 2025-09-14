import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import { buildChatPrompt } from '../../lib/aiService';
import { supabase } from '../../../lib/supabase';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: NextRequest) {
  try {
    const { waifuData, messages, newMessage, walletAddress } = await request.json();

    // Validate required fields
    if (!waifuData || !newMessage) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Try to get user for database storage (optional)
    let user = null;
    if (walletAddress) {
      try {
        const { data: userData } = await supabase
          .from('users')
          .select('id')
          .eq('wallet_address', walletAddress)
          .single();
        user = userData;
      } catch (error) {
        console.log('User not found in database, continuing without storage');
      }
    }

    // Build the system prompt
    const systemPrompt = buildChatPrompt(waifuData);
    
    // Prepare the conversation history
    const conversationMessages = [
      { role: 'system' as const, content: systemPrompt },
      ...messages.map((msg: any) => ({
        role: msg.role as 'user' | 'assistant',
        content: msg.content
      })),
      { role: 'user' as const, content: newMessage }
    ];

    const completion = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: conversationMessages,
      max_tokens: 150,
      temperature: 0.8,
      presence_penalty: 0.6,
      frequency_penalty: 0.3,
    });

    const response = completion.choices[0]?.message?.content;
    if (!response) {
      throw new Error('No response from AI');
    }

    // Store chat messages in database if user and waifu are available
    if (user && waifuData.id) {
      try {
        // Store user message
        await supabase
          .from('chat_messages')
          .insert([{
            user_id: user.id,
            waifu_id: waifuData.id,
            role: 'user',
            content: newMessage
          }]);

        // Store AI response
        await supabase
          .from('chat_messages')
          .insert([{
            user_id: user.id,
            waifu_id: waifuData.id,
            role: 'assistant',
            content: response
          }]);

        console.log('Chat messages stored in database');
      } catch (error) {
        console.error('Failed to store chat messages in database:', error);
        // Continue without storing - don't fail the chat
      }
    }

    return NextResponse.json({
      success: true,
      response
    });

  } catch (error) {
    console.error('Error in chat API:', error);
    return NextResponse.json(
      { error: 'Failed to get chat response' },
      { status: 500 }
    );
  }
}
