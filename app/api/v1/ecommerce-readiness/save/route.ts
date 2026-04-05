import { NextRequest, NextResponse } from 'next/server';
import { getAdminSupabase } from '@/lib/supabase/admin';
import { getAuthUserId, apiSuccess, apiError, API_ERRORS } from '@/lib/api/response';

export async function GET(request: NextRequest) {
  try {
    const userId = await getAuthUserId(request);
    if (!userId) {
      return apiError(API_ERRORS.UNAUTHORIZED);
    }

    const supabase = getAdminSupabase();
    const { data, error } = await (supabase.from as any)('ecommerce_assessments')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (error && error.code !== 'PGRST116') {
      console.error('Error fetching assessment:', error);
      return apiError(API_ERRORS.INTERNAL_SERVER_ERROR);
    }

    return apiSuccess(data || null);
  } catch (error) {
    console.error('GET /ecommerce-readiness/save error:', error);
    return apiError(API_ERRORS.INTERNAL_SERVER_ERROR);
  }
}

export async function POST(request: NextRequest) {
  try {
    const userId = await getAuthUserId(request);
    if (!userId) {
      return apiError(API_ERRORS.UNAUTHORIZED);
    }

    const body = await request.json();
    const { answers, score, results, roadmapProgress } = body;

    if (!answers || !score || !results) {
      return apiError(API_ERRORS.BAD_REQUEST);
    }

    const supabase = getAdminSupabase();
    const { data, error } = await (supabase.from as any)('ecommerce_assessments')
      .insert({
        user_id: userId,
        answers,
        score,
        results,
        roadmap_progress: roadmapProgress || {},
        updated_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) {
      console.error('Error saving assessment:', error);
      return apiError(API_ERRORS.INTERNAL_SERVER_ERROR);
    }

    return apiSuccess(data, { status: 201 });
  } catch (error) {
    console.error('POST /ecommerce-readiness/save error:', error);
    return apiError(API_ERRORS.INTERNAL_SERVER_ERROR);
  }
}
