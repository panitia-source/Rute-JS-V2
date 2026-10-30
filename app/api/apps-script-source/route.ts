import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET() {
  try {
    const codeGsPath = path.join(process.cwd(), 'Code.gs');
    const indexHtmlPath = path.join(process.cwd(), 'Index.html');

    const codeGs = fs.existsSync(codeGsPath)
      ? fs.readFileSync(codeGsPath, 'utf8')
      : '// File Code.gs';
    const indexHtml = fs.existsSync(indexHtmlPath)
      ? fs.readFileSync(indexHtmlPath, 'utf8')
      : '<!-- File Index.html -->';

    return NextResponse.json({ codeGs, indexHtml });
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
