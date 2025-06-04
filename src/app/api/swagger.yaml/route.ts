import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET() {
  try {
    // Get the absolute path to the Swagger YAML file
    const swaggerFilePath = path.join(process.cwd(), 'swagger.yaml');
    
    // Read the file content
    const fileContent = await fs.promises.readFile(swaggerFilePath, 'utf8');
    
    // Return the file content as plain text
    return new NextResponse(fileContent, {
      headers: {
        'Content-Type': 'text/yaml',
      },
    });
  } catch (error) {
    console.error('Error serving Swagger YAML file:', error);
    return new NextResponse(JSON.stringify({ error: 'Failed to load API documentation' }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }
} 