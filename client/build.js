import { build } from 'vite';
import { resolve } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

console.log('🚀 Starting custom Vite build...');

try {
  const result = await build({
    root: __dirname,
    build: {
      outDir: 'dist',
      emptyOutDir: true
    }
  });
  
  console.log('✅ Build completed successfully!');
  console.log('📁 Output directory:', resolve(__dirname, 'dist'));
} catch (error) {
  console.error('❌ Build failed:', error);
  process.exit(1);
} 