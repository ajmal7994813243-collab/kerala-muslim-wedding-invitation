import './globals.css';import type {Metadata} from 'next';
export const metadata:Metadata={title:'Wedding Invitation',description:'Personalized Kerala Muslim Wedding Invitation'};
export default function RootLayout({children}:{children:React.ReactNode}){return <html lang="en"><body>{children}</body></html>}
