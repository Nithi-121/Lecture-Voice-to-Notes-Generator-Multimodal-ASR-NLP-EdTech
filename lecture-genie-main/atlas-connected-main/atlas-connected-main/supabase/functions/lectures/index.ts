import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface Lecture {
  _id?: string;
  title: string;
  videoUrl: string;
  thumbnail: string;
  duration: number; // in seconds
  views: number;
  description?: string;
  tags?: string[];
  createdAt?: string;
  updatedAt?: string;
}

interface MongoResponse {
  document?: Lecture;
  documents?: Lecture[];
  insertedId?: string;
  matchedCount?: number;
  modifiedCount?: number;
  deletedCount?: number;
}

async function mongoRequest(
  action: string,
  collection: string,
  payload: Record<string, unknown>
): Promise<MongoResponse> {
  const MONGODB_URI = Deno.env.get('MONGODB_URI');
  
  if (!MONGODB_URI) {
    throw new Error('MONGODB_URI environment variable is not configured. Please add your MongoDB Atlas connection string.');
  }

  // Parse connection string to extract cluster info
  const uriMatch = MONGODB_URI.match(/mongodb\+srv:\/\/([^:]+):([^@]+)@([^/]+)\/([^?]+)/);
  if (!uriMatch) {
    throw new Error('Invalid MONGODB_URI format. Expected: mongodb+srv://user:password@cluster.mongodb.net/database');
  }

  const [, username, password, cluster, database] = uriMatch;
  
  // MongoDB Data API endpoint
  const apiUrl = `https://data.mongodb-api.com/app/data-${cluster.split('.')[0]}/endpoint/data/v1/action/${action}`;
  
  const requestBody = {
    dataSource: cluster.split('.')[0],
    database: database || 'lectures_db',
    collection,
    ...payload,
  };

  const response = await fetch(apiUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'api-key': password, // Using password as API key for Data API
    },
    body: JSON.stringify(requestBody),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error(`MongoDB API Error [${response.status}]:`, errorText);
    throw new Error(`MongoDB operation failed: ${response.status} - ${errorText}`);
  }

  return await response.json();
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const method = req.method;
    const pathParts = url.pathname.split('/').filter(Boolean);
    const lectureId = pathParts[1]; // /lectures/:id

    // GET /lectures - List all or search
    if (method === 'GET' && !lectureId) {
      const search = url.searchParams.get('search');
      const limit = parseInt(url.searchParams.get('limit') || '50');
      const skip = parseInt(url.searchParams.get('skip') || '0');

      let filter: Record<string, unknown> = {};
      
      if (search) {
        filter = {
          $or: [
            { title: { $regex: search, $options: 'i' } },
            { description: { $regex: search, $options: 'i' } },
            { tags: { $in: [new RegExp(search, 'i')] } },
          ],
        };
      }

      const result = await mongoRequest('find', 'lectures', {
        filter,
        sort: { createdAt: -1 },
        limit,
        skip,
      });

      return new Response(JSON.stringify({ 
        success: true, 
        data: result.documents || [] 
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // GET /lectures/:id - Get single lecture
    if (method === 'GET' && lectureId) {
      const result = await mongoRequest('findOne', 'lectures', {
        filter: { _id: { $oid: lectureId } },
      });

      if (!result.document) {
        return new Response(JSON.stringify({ 
          success: false, 
          error: 'Lecture not found' 
        }), {
          status: 404,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      // Increment view count
      await mongoRequest('updateOne', 'lectures', {
        filter: { _id: { $oid: lectureId } },
        update: { $inc: { views: 1 } },
      });

      return new Response(JSON.stringify({ 
        success: true, 
        data: result.document 
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // POST /lectures - Create lecture
    if (method === 'POST') {
      const body = await req.json() as Lecture;
      
      // Validate required fields
      if (!body.title || !body.videoUrl) {
        return new Response(JSON.stringify({ 
          success: false, 
          error: 'Title and videoUrl are required' 
        }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      const lecture: Lecture = {
        title: body.title.trim(),
        videoUrl: body.videoUrl.trim(),
        thumbnail: body.thumbnail || '',
        duration: body.duration || 0,
        views: 0,
        description: body.description?.trim() || '',
        tags: body.tags || [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      const result = await mongoRequest('insertOne', 'lectures', {
        document: lecture,
      });

      return new Response(JSON.stringify({ 
        success: true, 
        data: { ...lecture, _id: result.insertedId } 
      }), {
        status: 201,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // PUT /lectures/:id - Update lecture
    if (method === 'PUT' && lectureId) {
      const body = await req.json() as Partial<Lecture>;
      
      const updateFields: Record<string, unknown> = {
        updatedAt: new Date().toISOString(),
      };

      if (body.title) updateFields.title = body.title.trim();
      if (body.videoUrl) updateFields.videoUrl = body.videoUrl.trim();
      if (body.thumbnail !== undefined) updateFields.thumbnail = body.thumbnail;
      if (body.duration !== undefined) updateFields.duration = body.duration;
      if (body.description !== undefined) updateFields.description = body.description.trim();
      if (body.tags) updateFields.tags = body.tags;

      const result = await mongoRequest('updateOne', 'lectures', {
        filter: { _id: { $oid: lectureId } },
        update: { $set: updateFields },
      });

      if (result.matchedCount === 0) {
        return new Response(JSON.stringify({ 
          success: false, 
          error: 'Lecture not found' 
        }), {
          status: 404,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      return new Response(JSON.stringify({ 
        success: true, 
        message: 'Lecture updated successfully' 
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // DELETE /lectures/:id - Delete lecture
    if (method === 'DELETE' && lectureId) {
      const result = await mongoRequest('deleteOne', 'lectures', {
        filter: { _id: { $oid: lectureId } },
      });

      if (result.deletedCount === 0) {
        return new Response(JSON.stringify({ 
          success: false, 
          error: 'Lecture not found' 
        }), {
          status: 404,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      return new Response(JSON.stringify({ 
        success: true, 
        message: 'Lecture deleted successfully' 
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({ 
      success: false, 
      error: 'Method not allowed' 
    }), {
      status: 405,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Lectures API Error:', error);
    
    const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
    const isConnectionError = errorMessage.includes('MONGODB_URI') || 
                              errorMessage.includes('connection') ||
                              errorMessage.includes('network');

    return new Response(JSON.stringify({ 
      success: false, 
      error: errorMessage,
      hint: isConnectionError 
        ? 'Check your MongoDB Atlas connection string and ensure your IP is whitelisted.'
        : undefined
    }), {
      status: isConnectionError ? 503 : 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});