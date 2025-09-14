import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '../../../lib/supabase';

// Rate limiting helper
function canPerformAction(lastActionTime: string | null, cooldownMinutes: number = 10): boolean {
  if (!lastActionTime) return true;
  
  const lastAction = new Date(lastActionTime);
  const now = new Date();
  const timeDiff = now.getTime() - lastAction.getTime();
  const minutesDiff = timeDiff / (1000 * 60);
  
  return minutesDiff >= cooldownMinutes;
}

export async function POST(request: NextRequest) {
  try {
    const { walletAddress, waifuId, voteType } = await request.json();

    if (!walletAddress) {
      return NextResponse.json(
        { error: 'Wallet connection required to vote' },
        { status: 401 }
      );
    }

    if (!waifuId || !voteType || !['like', 'dislike'].includes(voteType)) {
      return NextResponse.json(
        { error: 'Invalid vote data' },
        { status: 400 }
      );
    }

    // Get user
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('wallet_address', walletAddress)
      .single();

    if (userError || !user) {
      return NextResponse.json(
        { error: 'User not found. Please connect wallet first.' },
        { status: 404 }
      );
    }

    // Check rate limit for voting
    if (!canPerformAction(user.last_vote, 10)) {
      return NextResponse.json(
        { error: 'Rate limit: You can only vote once every 10 minutes' },
        { status: 429 }
      );
    }

    // Check if user already voted on this waifu
    const { data: existingVote, error: voteCheckError } = await supabase
      .from('votes')
      .select('*')
      .eq('user_id', user.id)
      .eq('waifu_id', waifuId)
      .single();

    if (voteCheckError && voteCheckError.code !== 'PGRST116') {
      throw voteCheckError;
    }

    if (existingVote) {
      return NextResponse.json(
        { error: 'You have already voted on this waifu' },
        { status: 409 }
      );
    }

    // Create vote record
    const { error: voteError } = await supabase
      .from('votes')
      .insert({
        user_id: user.id,
        waifu_id: waifuId,
        vote_type: voteType
      });

    if (voteError) throw voteError;

    // Update waifu vote count
    const { data: waifu, error: waifuFetchError } = await supabase
      .from('waifus')
      .select('likes, dislikes')
      .eq('id', waifuId)
      .single();

    if (waifuFetchError) throw waifuFetchError;

    const updateData = voteType === 'like' 
      ? { likes: waifu.likes + 1 }
      : { dislikes: waifu.dislikes + 1 };

    const { data: updatedWaifu, error: updateError } = await supabase
      .from('waifus')
      .update(updateData)
      .eq('id', waifuId)
      .select()
      .single();

    if (updateError) throw updateError;

    // Update user's last vote time
    await supabase
      .from('users')
      .update({ last_vote: new Date().toISOString() })
      .eq('id', user.id);

    return NextResponse.json({
      success: true,
      waifu: updatedWaifu,
      voteType
    });

  } catch (error) {
    console.error('Error in votes API:', error);
    return NextResponse.json(
      { error: 'Failed to process vote' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const walletAddress = searchParams.get('walletAddress');
    const waifuId = searchParams.get('waifuId');

    if (!walletAddress || !waifuId) {
      return NextResponse.json(
        { error: 'Wallet address and waifu ID required' },
        { status: 400 }
      );
    }

    // Get user
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('id')
      .eq('wallet_address', walletAddress)
      .single();

    if (userError || !user) {
      return NextResponse.json({
        success: true,
        hasVoted: false,
        voteType: null
      });
    }

    // Check if user has voted on this waifu
    const { data: vote, error: voteError } = await supabase
      .from('votes')
      .select('vote_type')
      .eq('user_id', user.id)
      .eq('waifu_id', waifuId)
      .single();

    if (voteError && voteError.code !== 'PGRST116') {
      throw voteError;
    }

    return NextResponse.json({
      success: true,
      hasVoted: !!vote,
      voteType: vote?.vote_type || null
    });

  } catch (error) {
    console.error('Error checking vote status:', error);
    return NextResponse.json(
      { error: 'Failed to check vote status' },
      { status: 500 }
    );
  }
}
