import { NextRequest, NextResponse } from 'next/server';
import Replicate from 'replicate';
import { buildWaifuPrompts } from '../../lib/aiService';
import { createClient as createSupabaseClient } from '@supabase/supabase-js';

const replicate = new Replicate({
  auth: process.env.REPLICATE_API_TOKEN,
  userAgent: 'waifuhub-api/1.0',
});

export async function POST(request: NextRequest) {
  try {
    const { name, personality, style, hairColor, biography, walletAddress } = await request.json();

    console.log('Generate waifu request:', { name, personality, style, hairColor, walletAddress });

    // Validate required fields
    if (!name || !personality || !style || !hairColor || !walletAddress) {
      console.error('Missing required fields:', { name, personality, style, hairColor, walletAddress });
      return NextResponse.json(
        { error: 'Missing required fields including wallet address' },
        { status: 400 }
      );
    }

    // Check if Supabase is properly configured
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      console.error('Supabase environment variables not configured');
      return NextResponse.json(
        { error: 'Database not configured. Please set up Supabase environment variables.' },
        { status: 500 }
      );
    }

    console.log('Supabase URL:', process.env.NEXT_PUBLIC_SUPABASE_URL);
    console.log('Supabase Key configured:', !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

    // Initialize Supabase client with anon key (will need to handle RLS properly)
    const supabase = createSupabaseClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    // Try to check if user exists and can create a waifu (rate limiting)
    let canCreate = true;
    try {
      const { data: canCreateResult, error: rpcError } = await supabase.rpc('can_create_waifu', {
        user_wallet: walletAddress
      });
      
      if (rpcError) {
        console.error('Rate limiting check failed (database may not be set up):', rpcError);
        // Continue without rate limiting if database isn't set up yet
        console.log('Continuing without rate limiting...');
      } else {
        canCreate = canCreateResult;
      }
    } catch (error) {
      console.error('Database connection failed, continuing without rate limiting:', error);
      // Continue without rate limiting if database connection fails
    }

    if (!canCreate) {
      return NextResponse.json(
        { error: 'You must wait 10 minutes between waifu creations' },
        { status: 429 }
      );
    }

    // Try to get or create user (fallback if database isn't set up)
    let user = null;
    let useDatabase = true;
    
    try {
      let { data: existingUser } = await supabase
        .from('users')
        .select('id')
        .eq('wallet_address', walletAddress)
        .single();

      if (!existingUser) {
        const { data: newUser, error: userError } = await supabase
          .from('users')
          .insert([{ wallet_address: walletAddress }])
          .select('id')
          .single();

        if (userError) {
          console.error('Error creating user (database may not be set up):', userError);
          useDatabase = false;
        } else {
          user = newUser;
        }
      } else {
        user = existingUser;
      }
    } catch (error) {
      console.error('Database user operations failed, continuing without database:', error);
      useDatabase = false;
    }

    // Build prompts using the utility function
    const { imagePrompt, videoPrompt, characterProfile } = buildWaifuPrompts(
      name,
      personality,
      style,
      hairColor,
      biography || ''
    );

    console.log('Generating video with prompt:', videoPrompt);

    // Generate video using Luma Ray Flash model with NSFW filter bypass
    const videoOutput = await replicate.run(
      "luma/ray-flash-2-540p",
      {
        input: {
          prompt: videoPrompt,
          safety_checker: false,
          disable_safety_checker: true,
          nsfw_filter: false,
          content_filter: false,
          safety_tolerance: "permissive"
        }
      }
    );
    
    console.log('Video output:', videoOutput);

    // Extract URL from the video output
    let videoUrl: string;

    // Handle video output (single file object)
    const videoFile = videoOutput as any;
    if (videoFile && typeof videoFile.url === 'function') {
      videoUrl = videoFile.url();
    } else if (typeof videoFile === 'string') {
      videoUrl = videoFile;
    } else {
      videoUrl = String(videoFile);
    }

    console.log('Extracted videoUrl:', videoUrl);

    // Force database usage - create user if needed
    if (!user) {
      console.log('Creating new user in database...');
      try {
        const { data: newUser, error: userError } = await supabase
          .from('users')
          .insert([{ wallet_address: walletAddress }])
          .select('id')
          .single();

        if (userError) {
          console.error('Failed to create user:', userError);
          throw new Error('Database user creation failed: ' + userError.message);
        }
        user = newUser;
        console.log('User created successfully:', user);
      } catch (error) {
        console.error('Critical error creating user:', error);
        return NextResponse.json(
          { error: 'Failed to create user in database. Please ensure database schema is set up.' },
          { status: 500 }
        );
      }
    }

    // Store waifu in database (required)
    console.log('Storing waifu in database...');
    try {
      const { data: waifu, error: waifuError } = await supabase
        .from('waifus')
        .insert([{
          user_id: user.id,
          name,
          personality,
          style,
          hair_color: hairColor,
          biography: biography || '',
          character_profile: characterProfile,
          video_url: videoUrl,
          is_published: false,
          likes: 0,
          dislikes: 0
        }])
        .select()
        .single();

      if (waifuError) {
        console.error('Failed to create waifu in database:', waifuError);
        throw new Error('Database waifu creation failed: ' + waifuError.message);
      }

      console.log('Waifu created successfully in database:', waifu);

      // Update user's last waifu creation timestamp
      await supabase
        .from('users')
        .update({ last_waifu_creation: new Date().toISOString() })
        .eq('id', user.id);

      // Create waifu data object for response (localStorage compatible format)
      const waifuData = {
        id: waifu.id,
        name: waifu.name,
        personality: waifu.personality,
        style: waifu.style,
        hairColor: waifu.hair_color,
        biography: waifu.biography,
        characterProfile: waifu.character_profile,
        videoUrl: waifu.video_url,
        createdAt: waifu.created_at,
        isPublished: waifu.is_published
      };

      console.log('Returning waifu data:', waifuData);

      return NextResponse.json({
        success: true,
        waifu: waifuData,
        databaseUsed: true
      });

    } catch (error) {
      console.error('Failed to store waifu in database:', error);
      
      // Provide specific error messages based on the error type
      let errorMessage = 'Failed to store waifu in database.';
      let statusCode = 500;
      
      if (error instanceof Error) {
        if (error.message.includes('row-level security policy')) {
          errorMessage = 'Database access denied. Please run the fixed schema (supabase_schema_fixed.sql) in your Supabase SQL editor to fix RLS policies.';
          statusCode = 403;
        } else if (error.message.includes('relation') && error.message.includes('does not exist')) {
          errorMessage = 'Database tables not found. Please run the schema (supabase_schema_fixed.sql) in your Supabase SQL editor to set up the database.';
          statusCode = 503;
        } else if (error.message.includes('connection')) {
          errorMessage = 'Database connection failed. Please check your Supabase configuration.';
          statusCode = 503;
        } else {
          errorMessage = `Database error: ${error.message}`;
        }
      }
      
      return NextResponse.json(
        { 
          error: errorMessage,
          details: error instanceof Error ? error.message : String(error),
          suggestion: 'Run the supabase_schema_fixed.sql file in your Supabase SQL editor to fix database issues.'
        },
        { status: statusCode }
      );
    }

  } catch (error) {
    console.error('Error in generate-waifu API:', error);
    
    // Provide specific error messages for different types of failures
    let errorMessage = 'Failed to generate waifu.';
    let statusCode = 500;
    
    if (error instanceof Error) {
      if (error.message.includes('REPLICATE_API_TOKEN')) {
        errorMessage = 'Replicate API token not configured. Please set REPLICATE_API_TOKEN in your environment variables.';
        statusCode = 503;
      } else if (error.message.includes('rate limit') || error.message.includes('quota')) {
        errorMessage = 'API rate limit exceeded. Please try again later.';
        statusCode = 429;
      } else if (error.message.includes('network') || error.message.includes('fetch')) {
        errorMessage = 'Network error occurred while generating waifu. Please try again.';
        statusCode = 503;
      } else {
        errorMessage = `Generation failed: ${error.message}`;
      }
    }
    
    return NextResponse.json(
      { 
        error: errorMessage,
        details: error instanceof Error ? error.message : String(error)
      },
      { status: statusCode }
    );
  }
}
