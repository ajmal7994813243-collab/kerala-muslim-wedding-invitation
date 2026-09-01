import type {Config} from 'tailwindcss';
const config:Config={content:['./app/**/*.{js,ts,jsx,tsx,mdx}','./components/**/*.{js,ts,jsx,tsx,mdx}'],theme:{extend:{fontFamily:{serif:['Georgia','serif']},colors:{wine:'#8f1d2c',cream:'#fffaf7',gold:'#b9935a'}}},plugins:[]};
export default config;
