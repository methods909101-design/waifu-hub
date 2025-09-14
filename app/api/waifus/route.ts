import { NextRequest, NextResponse } from 'next/server';
import { createClient as createSupabaseClient } from '@supabase/supabase-js';

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
    const { walletAddress, waifuData, action, waifuId } = await request.json();

    console.log('Waifus API request:', { walletAddress, action, waifuId });

    if (!walletAddress) {
      console.error('No wallet address provided');
      return NextResponse.json(
        { error: 'Wallet connection required' },
        { status: 401 }
      );
    }

    // Initialize Supabase client
    const supabase = createSupabaseClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    // Get user
    console.log('Looking up user with wallet:', walletAddress);
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('wallet_address', walletAddress)
      .single();

    if (userError || !user) {
      console.error('User lookup failed:', userError);
      return NextResponse.json(
        { error: 'User not found. Please connect wallet first.' },
        { status: 404 }
      );
    }

    console.log('User found:', user);

    if (action === 'create') {
      // Check rate limit for waifu creation
      if (!canPerformAction(user.last_waifu_creation, 10)) {
        return NextResponse.json(
          { error: 'Rate limit: You can only create a waifu once every 10 minutes' },
          { status: 429 }
        );
      }

      // Create waifu
      const { data: newWaifu, error: createError } = await supabase
        .from('waifus')
        .insert({
          user_id: user.id,
          name: waifuData.name,
          personality: waifuData.personality,
          style: waifuData.style,
          hair_color: waifuData.hairColor,
          biography: waifuData.biography || '',
          character_profile: waifuData.characterProfile,
          video_url: waifuData.videoUrl,
          is_published: false,
          likes: 0,
          dislikes: 0
        })
        .select()
        .single();

      if (createError) throw createError;

      // Update user's last creation time
      await supabase
        .from('users')
        .update({ last_waifu_creation: new Date().toISOString() })
        .eq('id', user.id);

      return NextResponse.json({
        success: true,
        waifu: newWaifu
      });
    }

    if (action === 'publish') {
      if (!waifuId) {
        return NextResponse.json(
          { error: 'Waifu ID required for publishing' },
          { status: 400 }
        );
      }

      // Update waifu to published
      const { data: updatedWaifu, error: updateError } = await supabase
        .from('waifus')
        .update({ 
          is_published: true,
          published_at: new Date().toISOString()
        })
        .eq('id', waifuId)
        .eq('user_id', user.id)
        .select()
        .single();

      if (updateError) throw updateError;

      return NextResponse.json({
        success: true,
        waifu: updatedWaifu
      });
    }

    return NextResponse.json(
      { error: 'Invalid action' },
      { status: 400 }
    );

  } catch (error) {
    console.error('Error in waifus API:', error);
    return NextResponse.json(
      { error: 'Failed to manage waifu' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const walletAddress = searchParams.get('walletAddress');
    const type = searchParams.get('type'); // 'my' or 'community'

    // Initialize Supabase client
    const supabase = createSupabaseClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    if (type === 'community') {
      // Get all published waifus with user info
      const { data: waifus, error } = await supabase
        .from('waifus')
        .select(`
          *,
          users!inner(username, wallet_address)
        `)
        .eq('is_published', true)
        .order('published_at', { ascending: false });

      if (error) throw error;

      return NextResponse.json({
        success: true,
        waifus: waifus || []
      });
    }

    if (type === 'my') {
      if (!walletAddress) {
        return NextResponse.json(
          { error: 'Wallet address required for personal waifus' },
          { status: 400 }
        );
      }

      // Get user's waifus
      const { data: user, error: userError } = await supabase
        .from('users')
        .select('id')
        .eq('wallet_address', walletAddress)
        .single();

      if (userError || !user) {
        return NextResponse.json({
          success: true,
          waifus: []
        });
      }

      const { data: waifus, error } = await supabase
        .from('waifus')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      return NextResponse.json({
        success: true,
        waifus: waifus || []
      });
    }

    return NextResponse.json(
      { error: 'Invalid type parameter' },
      { status: 400 }
    );

  } catch (error) {
    console.error('Error fetching waifus:', error);
    return NextResponse.json(
      { error: 'Failed to fetch waifus' },
      { status: 500 }
    );
  }
}
