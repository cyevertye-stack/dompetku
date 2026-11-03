import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'DompetKu – Personal Expense Tracker',
    short_name: 'DompetKu',
    description: 'Aplikasi pencatatan, pengelolaan, dan analisis pengeluaran uang pribadi.',
    start_url: '/',
    display: 'standalone',
    background_color: '#0F172A',
    theme_color: '#1E3A8A',
    icons: [
      {
        src: '/favicon.ico',
        sizes: 'any',
        type: 'image/x-icon',
      },
    ],
  };
}
